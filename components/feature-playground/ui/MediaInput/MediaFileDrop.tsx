import { FC } from 'react';

import { Flex, Stack, Text } from '@chakra-ui/react';

import Info from '@/components/ui/Display/Info';
import FileDrop from '@/components/ui/Input/FileDrop';

interface Props {
  videoFile: File | string;
  audioFile: File | string;
  onFilesAdded: (e: File[]) => void;
  requirements: JSX.Element;
  accept?: string[];
}
const MediaFileDrop: FC<Props> = ({
  videoFile,
  audioFile,
  onFilesAdded,
  requirements,
  accept
}) => {
  return (
    <FileDrop
      onFilesAdded={onFilesAdded}
      accept={accept}
      title={
        <Stack alignItems={'center'} gap={0}>
          <Text>drag and drop video and audio file</Text>
          <Text>(must upload both a video file and audio file)</Text>
        </Stack>
      }
    >
      <Flex w="full">
        {videoFile && (
          <Flex w="50%" flex={1}>
            <Flex>video</Flex>
            {/* <FilePreview file={videoFile} type="video" /> */}
          </Flex>
        )}
        {audioFile && (
          <Flex w="50%" flex={1}>
            <Flex>audio</Flex>
            {/* <FilePreview file={audioFile} type="audio" /> */}
          </Flex>
        )}
      </Flex>
      <Info label="requirements" info={requirements} />
    </FileDrop>
  );
};

export default MediaFileDrop;
