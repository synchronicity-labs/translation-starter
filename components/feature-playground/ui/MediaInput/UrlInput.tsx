import { FC } from 'react';

import { Input, Text, Stack } from '@chakra-ui/react';

import Info from '@/components/ui/Display/Info';

interface Props {
  url: string;
  setUrl: (u: string) => void;
  disabled?: boolean;
  requirements?: JSX.Element;
  placeholder?: string;
}

const UrlInput: FC<Props> = ({
  url,
  setUrl,
  disabled,
  requirements,
  placeholder
}) => {
  const title = `Enter a video URL. Use Dropbox, AWS S3, or a similar file hosting service.`;
  return (
    <Stack w="full" gap={1}>
      <Text>{title}</Text>
      <Input
        type="text"
        name="videoUrl"
        placeholder={placeholder || 'enter url'}
        value={url as string}
        onChange={(e) => setUrl(e.target.value)}
        isDisabled={disabled}
      />
      {requirements && <Info label="requirements" info={requirements} />}
    </Stack>
  );
};

export default UrlInput;
