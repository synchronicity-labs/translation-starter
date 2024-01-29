import { FC } from 'react';

import { Flex, Heading, Stack, Tag, Text } from '@chakra-ui/react';

interface Props {
  title: string;
  subtitle?: string;
  tag?: string;
  className?: string;
}

const PageHeader: FC<Props> = ({ title, subtitle, tag, className }) => {
  return (
    <Stack w="full" className={className}>
      <Flex w="fit-content" alignItems="center" gap={2}>
        <Heading>{title}</Heading>
        {tag && (
          <Tag className="uppercase" size="sm">
            {tag}
          </Tag>
        )}
      </Flex>
      {subtitle && (
        <Text fontWeight="medium" fontSize={'xl'}>
          {subtitle}
        </Text>
      )}
    </Stack>
  );
};

export default PageHeader;
