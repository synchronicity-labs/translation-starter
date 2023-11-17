'use client';

import Requirements from './Requirements';
import UrlInput from './UrlInput';
import Info from '@/components/ui/Display/Info';
import FileDrop from '@/components/ui/Input/FileDrop';
import Selector from '@/components/ui/Input/Selector';
import { SignUpModal } from '@/components/ui/Modals';
import { Job, JobStatus } from '@/types/db';
import loadFfmpeg from '@/utils/load-ffmpeg';
import supabase from '@/utils/supabase';
import transcodeVideoToAudio from '@/utils/transcode-video-to-audio';
import {
  Button,
  Flex,
  Select,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Session } from '@supabase/auth-helpers-nextjs';
import { FC, useCallback, useEffect, useState, useRef } from 'react';
import { HiSparkles } from 'react-icons/hi';

interface Language {
  name: string;
  code: string;
}

interface Props {
  session: Session | null;
}

const MediaInput: FC<Props> = ({ session }) => {
  const ffmpegRef = useRef<any>(null);

  const toast = useToast();
  const [video, setVideo] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  const [language, setLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const submitDisabled = !url || !language;
  const inputOptions = ['upload', 'url'];

  // Initalize input type
  const [inputType, setInputType] = useState(inputOptions[0]);

  // Requirements for video file
  const requirements = {
    label: `Video Requirements`,
    items: [
      `Accepted Formats: MP4`,
      `Max video file size: 250mb`,
      `Max resolution: 1080p`,
      `Max frame rate: 30fps`,
      `Avoid muliple people in the video`,
      `Make sure there's a face in the first frame of the video`
    ]
  };

  const languages: Language[] = [
    { name: 'Mandarin Chinese', code: 'zh' },
    { name: 'Spanish', code: 'es' },
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Portuguese', code: 'pt' },
    { name: 'Bengali (Bangla)', code: 'bn' },
    { name: 'Russian', code: 'ru' },
    { name: 'Urdu', code: 'ur' },
    { name: 'French', code: 'fr' },
    { name: 'Punjabi', code: 'pa' },
    { name: 'Japanese', code: 'ja' },
    { name: 'German', code: 'de' },
    { name: 'Javanese', code: 'jv' },
    { name: 'Wu Chinese (Shanghainese)', code: 'wuu' },
    { name: 'Telugu', code: 'te' },
    { name: 'Vietnamese', code: 'vi' },
    { name: 'Marathi', code: 'mr' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Turkish', code: 'tr' }
  ];

  // Close sign up modal if user is signed in
  useEffect(() => {
    if (session && isOpen) {
      onClose();
    }
  }, [session]);

  // Load FFMPEG on component mount
  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
  };

  async function uploadFile(file: File, filePath: string) {
    console.log('in uploadFile - file: ', file);
    const { data, error } = await supabase.storage
      .from('translation')
      .upload(filePath, file, {
        contentType: file.type
      });

    if (error) {
      console.error('Upload error:', error);
      return;
    }

    if (!data) {
      console.error('No data returned from upload');
      return;
    }

    console.log('data: ', data);

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/translation/${data.path}`;

    return url;
  }

  const handleJobFailed = async (errorMessage: string, jobId?: string) => {
    setLoading(false);
    setVideo(null);
    setUrl('');
    setLanguage(null);
    {
      jobId &&
        (await fetch('/api/db/update-job', {
          method: 'POST',
          body: JSON.stringify({
            jobId,
            updatedFields: {
              status: 'failed' as JobStatus
            }
          })
        }));
    }
    toast({
      title: 'Error occured while creating video',
      description: errorMessage,
      status: 'error',
      duration: null,
      isClosable: true
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    // If user isn't signed in, open sign up modal
    if (!session) {
      onOpen();
      return;
    }

    console.log('MediaInput - video: ', video);
    console.log('MediaInput - url: ', url);

    // If no video is selected, show error
    if (!video && !url) {
      handleJobFailed('Video file or url is required');
      return;
    }

    // Create new job
    const createJob = await fetch(`/api/db/create-job`, {
      method: 'POST'
    });

    if (!createJob.ok) {
      handleJobFailed(`Failed to create job`);
      return;
    }

    const { data: job } = await createJob.json();

    // Update job status to uploading
    const updateJobToUploading = await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.id,
        updatedFields: {
          status: 'uploading' as JobStatus,
          target_language: language
        }
      })
    });

    if (!updateJobToUploading.ok) {
      handleJobFailed(`Failed to update job status to 'uploading'`);
      return;
    }

    // TODO: Add logic for creating local file for transcode function

    // 1. Transcode video to audio
    const videoInput = video || url;
    const { blob, output } = await transcodeVideoToAudio(
      ffmpegRef.current,
      videoInput!
    );

    // 2. Upload video and audio to Supabase storage
    const videoUrl = video
      ? await uploadFile(video!, `public/input-video-${job.id}-${video!.name}`)
      : url;

    const audioUrl = await uploadFile(
      blob,
      `public/input-audio-${job.id}-${output}`
    );

    console.log('MediaInput - videoUrl: ', videoUrl);
    console.log('MediaInput - audioUrl: ', audioUrl);

    if (!videoUrl || !audioUrl) {
      handleJobFailed(`Failed to upload video and audio to Supabase storage`);
      return;
    }

    // Update job status to transcribing
    const updateJobToTranscribing = await fetch('/api/db/update-job', {
      method: 'POST',
      body: JSON.stringify({
        jobId: job.id,
        updatedFields: {
          original_video_url: videoUrl,
          original_audio_url: audioUrl
          // status: 'transcribing' as JobStatus
        }
      })
    });

    if (!updateJobToTranscribing.ok) {
      handleJobFailed(`Failed to update job status to 'transcribing'`);
      return;
    }

    setLoading(false);
    setVideo(null);
    setLanguage(null);
    setUrl('');
  };

  // Function for updating video state when file is added
  const handleAddFile = useCallback((e: File[]) => {
    const file = e[0];
    if (file.type === 'video/mp4') {
      setVideo(e[0]);
      setUrl(URL.createObjectURL(e[0]));
    }
  }, []);

  return (
    <Flex w="full" h="full" justifyContent="center">
      <form className="flex justify-center w-full" onSubmit={handleSubmit}>
        <Stack maxW="600px" w="full" p={4} rounded="md" alignItems={'center'}>
          <Selector
            options={inputOptions}
            selection={inputType}
            setSelection={setInputType}
          />
          <Flex w="full" justifyContent={'center'}>
            {inputType === 'upload' && (
              <FileDrop onFilesAdded={handleAddFile} disabled={loading}>
                {video && <Text>{url}</Text>}
                <Flex p="4">
                  <Info
                    label="requirements"
                    info={<Requirements requirements={[requirements]} />}
                  />
                </Flex>
              </FileDrop>
            )}
            {inputType === 'url' && (
              <UrlInput
                url={url}
                setUrl={setUrl}
                placeholder="https://video.example.com/eea672b9-ad0b-4010-ad89-37fab618b7c7"
                requirements={<Requirements requirements={[requirements]} />}
                disabled={loading}
              />
            )}
          </Flex>
          <Select
            placeholder="Select target language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language || ''}
            disabled={loading}
          >
            {languages.map(({ name, code }) => {
              return (
                <option key={code} value={code}>
                  {name}
                </option>
              );
            })}
          </Select>
          <Tooltip
            hasArrow
            label={
              submitDisabled
                ? 'Need to add a video file and select a language to continue.'
                : ''
            }
          >
            <Flex justifyContent="center">
              <Button
                type="submit"
                isLoading={loading}
                loadingText={'Submitting'}
                isDisabled={submitDisabled}
                leftIcon={<HiSparkles />}
              >
                submit
              </Button>
            </Flex>
          </Tooltip>
        </Stack>
      </form>
      <SignUpModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
};

export default MediaInput;
