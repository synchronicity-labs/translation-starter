'use client';

import FileDrop from '../FileDrop';
import Info from '../Info';
import { SignUpModal } from '../Modals';
import Selector from '../Selector';
import Requirements from './Requirements';
import UrlInput from './UrlInput';
import { insertBeforeDot } from '@/utils/helpers';
import {
  Button,
  Flex,
  Select,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { Session } from '@supabase/auth-helpers-nextjs';
import { S3 } from 'aws-sdk';
import { FC, useCallback, useEffect, useState } from 'react';
import { HiSparkles } from 'react-icons/hi';
import { v4 as uuidv4 } from 'uuid';

interface Language {
  name: string;
  code: string;
}

interface Props {
  session: Session | null;
}

const MediaInput: FC<Props> = ({ session }) => {
  const [video, setVideo] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
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

  // Uploads file to S3 and calls '/api/translate' endpoint
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (session) {
      setLoading(true);
      if (video) {
        // Initialize S3 instance
        const s3 = new S3({
          accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
          secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
          region: process.env.NEXT_PUBLIC_S3_REGION
        });
        const params = {
          Bucket: 'synchlabs-public',
          Key: insertBeforeDot(
            `/translation-test-input/${video.name}`,
            uuidv4()
          ),
          Body: video,
          ContentType: video.type
        };
        const uploadPromise = s3.upload(params);
        const upload = await uploadPromise.promise();
        const url = upload.Location;
        // const response = await fetch('/api/translate', {
        //   method: 'POST',
        //   body: JSON.stringify({ videoUrl: url, language })
        // });
        // const data = await response.json();
        setLoading(false);
        setVideo(null);
        setUrl(null);
        setLanguage(null);
        // return data;
        return null;
      }
      setLoading(false);
      setVideo(null);
      setUrl(null);
      setLanguage(null);
    } else {
      onOpen();
    }
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
              <FileDrop onFilesAdded={handleAddFile}>
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
              />
            )}
          </Flex>
          <Select
            placeholder="Select target language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language || ''}
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
                loadingText="submitting"
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
