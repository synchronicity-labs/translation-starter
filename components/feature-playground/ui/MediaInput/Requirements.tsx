import { FC } from 'react';

import { Flex, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react';

interface Props {
  requirements: { label: string; items: string[] }[];
}

const Requirements: FC<Props> = ({ requirements }) => {
  return (
    <Stack w="full" p={2}>
      {requirements.map((requirement) => {
        return (
          <Stack key={requirement.label} gap={0} w="full">
            <Text fontWeight="bold" w="full">
              {requirement.label}
            </Text>
            <UnorderedList>
              {requirement.items.map((item) => {
                return (
                  <Flex key={item} px={4}>
                    <ListItem>{item}</ListItem>
                  </Flex>
                );
              })}
            </UnorderedList>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default Requirements;
