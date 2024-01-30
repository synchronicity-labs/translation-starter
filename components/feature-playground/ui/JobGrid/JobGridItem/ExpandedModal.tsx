import { useEffect, useState } from 'react';

import {
  Button,
  Center,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
  useMediaQuery
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { BsTranslate } from 'react-icons/bs';
import { FaTrash, FaVideo } from 'react-icons/fa';

import VideoPlayer from '@/components/ui/VideoPlayer';
import { languages } from '@/data/languages';
import { Job, Transcript } from '@/types/db';
import { removeEdgeParentheses } from '@/utils/helpers';

import DeleteModal from './DeleteModal';

interface Props {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

const Detail = (props: { title: string; value: string }) => {
  const [isLargerThan640] = useMediaQuery('(min-width: 640px)', {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  });

  return (
    <Flex
      direction={isLargerThan640 ? 'row' : 'column'}
      w="full"
      gap="2"
      p={'2'}
      alignItems="center"
      bgColor="blackAlpha.200"
      rounded="md"
    >
      <Text fontWeight="bold" fontSize="xs" whiteSpace={'nowrap'}>
        {props.title}
      </Text>
      {isLargerThan640 ? (
        <Center h={'4'} bgColor={'gray.200'}>
          <Divider orientation={'vertical'} />
        </Center>
      ) : (
        <Divider />
      )}

      <Text fontSize="xs" textAlign={['center', 'start']}>
        {props.value}
      </Text>
    </Flex>
  );
};

const ExpandedModal = ({ job, isOpen, onClose }: Props) => {
  const [show, setShow] = useState('translated-video');
  const [url, setUrl] = useState(job.video_url);
  const timeStamp = DateTime.fromJSDate(new Date(job.created_at)).toFormat(
    "MMMM d, yyyy 'at' h:mm a"
  );

  useEffect(() => {
    setShow('translated-video');
  }, []);

  useEffect(() => {
    setUrl(job.video_url);
  }, [job]);

  useEffect(() => {
    switch (show) {
      case 'translated-video':
        setUrl(job.video_url);
        break;
      case 'original-video':
        setUrl(job.original_video_url);
        break;
      default:
        setUrl(null);
    }
  }, [job, show]);

  const {
    isOpen: deleteIsOpen,
    onOpen: deleteOnOpen,
    onClose: deleteOnClose
  } = useDisclosure();

  const [isLargerThan640] = useMediaQuery('(min-width: 640px)', {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  });

  const transcript = job.transcript as Transcript;

  const extractedTranscript = transcript
    ? transcript
        .reduce((acc: string, segment) => {
          const segmentString = segment.words
            .reduce((innerAcc: string, wordDetail) => {
              return innerAcc + wordDetail.word + ' ';
            }, '')
            .trim();
          return acc + segmentString + ' ';
        }, '')
        .trim()
    : '';

  const sourceLanguage = languages.find(
    (language) => language.code === job.source_language
  );

  const targetLanguage = languages.find(
    (language) => language.code === job.target_language
  );

  const showTranscript =
    show === 'original-video'
      ? Boolean(extractedTranscript)
      : Boolean(job.translated_text);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        bgColor="whiteAlpah.100"
        border={'2px solid'}
        borderColor={'RGBA(255,255,255,0.4)'}
        m={4}
        p={4}
        top={20}
        maxW={800}
      >
        <ModalCloseButton />
        <ModalBody>
          <Stack p={2}>
            <Flex gap={4}>
              <Detail title="Created" value={timeStamp} />
              <Detail title="Job ID" value={job.id} />
            </Flex>
            <Flex gap={4}>
              <Detail
                title="Source Language"
                value={
                  sourceLanguage
                    ? sourceLanguage.name
                    : (job.source_language as string)
                }
              />
              <Detail
                title="Target Language"
                value={
                  targetLanguage
                    ? targetLanguage.name
                    : (job.target_language as string)
                }
              />
            </Flex>
            <Flex justifyContent={'space-between'}>
              <Flex gap={'2'}>
                <Button
                  onClick={() => setShow('translated-video')}
                  variant={show === 'original-video' ? 'solid' : 'outline'}
                >
                  <Tooltip hasArrow label="Lip synced video">
                    <Flex w="full" h="full" alignItems="center">
                      {isLargerThan640 ? (
                        <Text fontSize={['xs', 'xs', 'sm']}>
                          Translated Video
                        </Text>
                      ) : (
                        <BsTranslate />
                      )}
                    </Flex>
                  </Tooltip>
                </Button>
                <Button
                  onClick={() => setShow('original-video')}
                  variant={show === 'original-video' ? 'outline' : 'solid'}
                >
                  <Tooltip hasArrow label="Original video">
                    <Flex w="full" h="full" alignItems="center">
                      {isLargerThan640 ? (
                        <Text fontSize={['xs', 'xs', 'sm']}>
                          Original Video
                        </Text>
                      ) : (
                        <FaVideo />
                      )}
                    </Flex>
                  </Tooltip>
                </Button>
              </Flex>
              <Button
                p={'0'}
                onClick={deleteIsOpen ? deleteOnClose : deleteOnOpen}
              >
                <Tooltip hasArrow label="Delete video">
                  <Flex
                    h="full"
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <FaTrash />
                  </Flex>
                </Tooltip>
              </Button>
            </Flex>
            <Flex></Flex>
            {url ? (
              <VideoPlayer key={`${job.id}-${url}`} url={url} />
            ) : (
              <Flex
                overflow="hidden"
                w="full"
                aspectRatio={'16/9'}
                justifyContent={'center'}
                alignItems={'center'}
                bgColor={'whiteAlpha.200'}
                bgGradient="linear(to-b, RGBA(128,96,159,0.1), transparent)"
                rounded={'md'}
              >
                <Text fontWeight="bold" fontSize="2xl">
                  Media not found.
                </Text>
              </Flex>
            )}
            {showTranscript && (
              <Stack p={4} bgColor="blackAlpha.200" rounded="md">
                <Text fontWeight="bold" fontSize="md">
                  Transcript
                </Text>
                <Flex maxH={120} overflow={'scroll'}>
                  <Text fontSize="sm">
                    {show === 'original-video'
                      ? extractedTranscript
                      : removeEdgeParentheses(job.translated_text || '')}
                  </Text>
                </Flex>
              </Stack>
            )}
          </Stack>
        </ModalBody>
      </ModalContent>
      <DeleteModal
        jobId={job.id}
        isOpen={deleteIsOpen}
        onClose={deleteOnClose}
      />
    </Modal>
  );
};

export default ExpandedModal;
