'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

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
import { HiSparkles } from 'react-icons/hi';

import Info from '@/components/ui/Display/Info';
import FileDrop from '@/components/ui/Input/FileDrop';
import Selector from '@/components/ui/Input/Selector';
import { SignUpModal } from '@/components/ui/Modals';
import { languages } from '@/data/languages';
import { JobStatus } from '@/types/db';
import loadFfmpeg from '@/utils/load-ffmpeg';
import { checkIfValidYoutubeUrl } from '@/utils/regex';
import supabase from '@/utils/supabase';
import transcodeVideoToAudio from '@/utils/transcode-video-to-audio';
import uploadYoutubeToSupabase from '@/utils/upload-youtube-to-supabase';

import Requirements from './Requirements';
import UrlInput from './UrlInput';
import YoutubeInput from './YoutubeInput';

interface Props {
  session: Session | null;
  creditsAvailable: boolean;
}

const MediaInput: FC<Props> = ({ session, creditsAvailable }) => {
  const ffmpegRef = useRef<any>(null);

  const toast = useToast();
  const [video, setVideo] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  const [language, setLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const submitDisabled = !url || !language;
  const inputOptions = ['upload', 'youtube', 'other url'];

  // Initalize input type
  const [inputType, setInputType] = useState(inputOptions[0]);

  // Requirements for video file
  const requirements = {
    label: `Video Requirements`,
    items: [
      `Accepted Formats: MP4`,
      `Max video file size: 50mb`,
      `Max resolution: 720p`,
      `Max frame rate: 30fps`,
      `Avoid multiple people in the video`,
      `Make sure there's a face in the first frame of the video`
    ]
  };

  // Requirements for youtube url
  const youtubeRequirements = {
    label: `Video Requirements`,
    items: [
      `Max video length: 2min`,
      `Max resolution: 720p`,
      `Max frame rate: 30fps`,
      `Avoid multiple people in the video`,
      `Make sure there's a face in the first frame of the video`
    ]
  };

  // Show warning when user tries to leave/refresh page
  useEffect(() => {
    // This function will be called when the component is mounted
    const handleBeforeUnload = (event: BeforeUnloadEvent): string | void => {
      const message: string =
        'Are you sure you want to leave this page? Any jobs that are uploading will not be saved.';
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Close sign up modal if user is signed in
  useEffect(() => {
    if (session && isOpen) {
      onClose();
    }
  }, [isOpen, onClose, session]);

  const load = useCallback(async () => {
    const ffmpeg_response: FFmpeg = await loadFfmpeg();
    ffmpegRef.current = ffmpeg_response;
  }, []);

  // Load FFMPEG on component mount
  useEffect(() => {
    load();
  }, [load]);

  const uploadFile = useCallback(async (file: File, filePath: string) => {
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

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/translation/${data.path}`;

    return url;
  }, []);

  const getUploadUrl = useCallback(
    async (fileOrUrl: File | string | undefined, pathPrefix: string) => {
      try {
        if (typeof fileOrUrl === 'string') {
          if (checkIfValidYoutubeUrl(fileOrUrl)) {
            const response = await uploadYoutubeToSupabase(
              fileOrUrl,
              pathPrefix
            );
            return response.data.url;
          } else {
            return fileOrUrl;
          }
        } else if (fileOrUrl instanceof File) {
          return await uploadFile(fileOrUrl, `${pathPrefix}.mp4`);
        } else {
          throw new Error('Invalid file or URL provided');
        }
      } catch (error: any) {
        throw new Error('Error in getUploadUrl: ' + error.message);
      }
    },
    [uploadFile]
  );

  const showErrorMessage = useCallback(
    (message: string) => {
      toast({
        title: 'Error occured while creating video',
        description: message,
        status: 'error',
        duration: null,
        isClosable: true
      });
    },
    [toast]
  );

  const handleJobFailed = useCallback(
    async (errorMessage: string, jobId?: string) => {
      setLoading(false);
      setVideo(null);
      setUrl('');
      setLanguage(null);

      showErrorMessage(errorMessage);
      if (!jobId) {
        return;
      }

      await fetch('/api/db/update-job', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          updatedFields: {
            status: 'failed' as JobStatus
          }
        })
      });
    },
    [showErrorMessage]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setLoading(true);

      // If user isn't signed in, open sign up modal
      if (!session) {
        onOpen();
        return;
      }

      // If no video is selected, show error
      if (!video && !url) {
        await handleJobFailed('Video file or url is required');
        return;
      }

      if (!creditsAvailable) {
        await handleJobFailed(
          'You do not have enough credits to create a video'
        );
        return;
      }

      // Create new job
      const createJob = await fetch(`/api/db/create-job`, {
        method: 'POST'
      });

      if (!createJob.ok) {
        await handleJobFailed(`Failed to create job`);
        return;
      }

      const { data: job } = await createJob.json();

      // Upload video to supabase storage
      const videoUrl = await getUploadUrl(
        video || url,
        `public/input-video-${job.id}`
      );

      // Update job status to uploading
      const updateJobToUploading = await fetch('/api/db/update-job', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job.id,
          updatedFields: {
            status: 'uploading' as JobStatus,
            target_language: language
          },
          videoUrl
        })
      });

      if (!updateJobToUploading.ok) {
        await handleJobFailed(`Failed to update job status to 'uploading'`);
        return;
      }

      // Transcode video to audio
      const { blob, output } = await transcodeVideoToAudio(
        ffmpegRef.current,
        videoUrl
      );

      const audioUrl = await uploadFile(
        blob,
        `public/input-audio-${job.id}-${output}`
      );

      if (!videoUrl || !audioUrl) {
        await handleJobFailed(
          `Failed to upload video and audio to Supabase storage`
        );
        return;
      }

      // Update job
      const updateJobToTranscribing = await fetch('/api/db/update-job', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job.id,
          updatedFields: {
            status: 'uploaded',
            original_video_url: videoUrl,
            original_audio_url: audioUrl
          }
        })
      });

      if (!updateJobToTranscribing.ok) {
        await handleJobFailed(`Failed to update job status to 'transcribing'`);
        return;
      }

      setLoading(false);
      setVideo(null);
      setLanguage(null);
      setUrl('');
    },
    [
      creditsAvailable,
      getUploadUrl,
      handleJobFailed,
      language,
      onOpen,
      session,
      uploadFile,
      url,
      video
    ]
  );

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
            {inputType === 'youtube' && (
              <YoutubeInput
                url={url}
                setUrl={setUrl}
                disabled={loading}
                requirements={
                  <Requirements requirements={[youtubeRequirements]} />
                }
              />
            )}
            {inputType === 'other url' && (
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
