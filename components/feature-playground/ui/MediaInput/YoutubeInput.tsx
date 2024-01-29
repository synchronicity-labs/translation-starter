import { FC } from 'react';

import { Button, Text, Stack, Tooltip, Input } from '@chakra-ui/react';

import Info from '@/components/ui/Display/Info';
import { checkIfValidYoutubeUrl } from '@/utils/regex';

interface Props {
  url: string;
  setUrl: (u: string) => void;
  disabled?: boolean;
  requirements?: JSX.Element;
}

const YoutubeInput: FC<Props> = ({ url, setUrl, disabled, requirements }) => {
  const title = `Enter a YouTube URL.`;

  // const isValidYoutubeUrl = checkIfValidYoutubeUrl(url);

  const placeholder = `https://www.youtube.com/watch?v=-_0sgi3ywLk`;

  return (
    <Stack w="full" gap={1}>
      <Text>{title}</Text>
      <Input
        type="text"
        name="videoUrl"
        placeholder={placeholder}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        isDisabled={disabled}
      />
      {requirements && <Info label="requirements" info={requirements} />}
    </Stack>
  );
};

export default YoutubeInput;
