import Info from '@/components/ui/Display/Info';
import { Input, Text, Stack } from '@chakra-ui/react';
import { FC } from 'react';

interface Props {
  url: string | null;
  setUrl: (u: string | null) => void;
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
  const title = `Enter a video URL. Use Dropbox, Amazon S3, or another similar file hosting service.`;
  return (
    <Stack p={2}>
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
