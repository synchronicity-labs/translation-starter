import { FC } from 'react';

import Image from 'next/image';

import { Box, Flex, Stack, Text } from '@chakra-ui/react';

import SelectLanguage from '@/assets/Instructions/select-language.png';
import SelectVideo from '@/assets/Instructions/select-video.png';
import Submit from '@/assets/Instructions/submit.png';

interface Props {}

const Instructions: FC<Props> = () => {
  const title = `How it works`;
  const subtitle = `Transform any video to speak your language, with perfectly matched lip movements. `;

  const steps = [
    {
      title: `Choose Your Video`,
      description: `Drag and drop your chosen video file into the app, or paste the URL of the video you wish to translate. Our platform supports a variety of formats for your convenience.`,
      img: SelectVideo
    },
    {
      title: `Select Your Language`,
      description: `Browse through our extensive list of languages and pick the one you need. From common tongues to rare dialects, find the voice of your message.`,
      img: SelectLanguage
    },
    {
      title: `Sync and Create`,
      description: `Hit the 'Create' button and watch the magic happen. Our advanced AI will not only translate the audio but will also sync the speakers' lips to your new audio seamlessly.`,
      img: Submit
    },
    {
      title: `Download and Share`,
      description: `Once the video is ready, download it to your device or share it directly from the app. Spread your message far and wide, in any language, with complete lip-sync harmony.`
    }
  ];

  return (
    <Flex bg="whiteAlpha.100" rounded="md">
      <Stack
        w="full"
        gap={8}
        px="8"
        py="16"
        alignItems={'center'}
        textColor={'white'}
      >
        <Stack alignItems={'center'} gap={4}>
          <Text fontSize="5xl" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="lg" color="gray.50">
            {subtitle}
          </Text>
        </Stack>
        <Stack w="full" gap={8}>
          {steps.map(({ title, description, img }, index) => {
            return (
              <Stack key={title} w="full" px={8} gap={8}>
                <Flex alignItems={'center'} fontWeight="bold" gap={4}>
                  <Flex
                    w="12"
                    h="12"
                    rounded="md"
                    justifyContent={'center'}
                    alignItems={'center'}
                    bg="whiteAlpha.200"
                  >
                    <Text fontSize="2xl">{index + 1}</Text>
                  </Flex>
                  <Text fontSize="lg">{title}</Text>
                </Flex>
                <Stack px={[0, 0, 0, 16]} gap={8} w="full">
                  {img && (
                    <Flex w="full" h={96} position="relative">
                      <Image
                        src={img}
                        alt={title}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Flex>
                  )}

                  <Text>{description}</Text>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Flex>
  );
};

export default Instructions;
