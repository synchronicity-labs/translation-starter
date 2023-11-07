import VideoPlayer from '@/components/ui/VideoPlayer';
import { Database, Job } from '@/types_db';
import {
  Modal,
  ModalContent,
  ModalBody,
  Flex,
  Stack,
  Text,
  Center,
  Divider,
  useMediaQuery,
  useDisclosure,
  Button,
  Tooltip,
  ModalCloseButton
} from '@chakra-ui/react';
import { DateTime } from 'luxon';
import { useState } from 'react';
import { BsTranslate } from 'react-icons/bs';
import { FaTrash, FaVideo } from 'react-icons/fa';

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

  console.log('props: ', props);
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

const JobGridItemExpandedModal = ({ job, isOpen, onClose }: Props) => {
  const [show, setShow] = useState('translated-video');
  const url = job.video_url || job.original_video_url || '';
  const timeStamp = DateTime.fromJSDate(new Date(job.created_at)).toFormat(
    "MMMM d, yyyy 'at' h:mm a"
  );

  const {
    isOpen: deleteIsOpen,
    onOpen: deleteOnOpen,
    onClose: deleteOnClose
  } = useDisclosure();

  const [isLargerThan640] = useMediaQuery('(min-width: 640px)', {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  });

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
          <Stack>
            <Flex gap={4}>
              <Detail title="Created" value={timeStamp} />
              <Detail title="Job ID" value={job.id} />
            </Flex>
            <Flex justifyContent={'space-between'}>
              <Flex gap={'2'}>
                <Button
                  onClick={() => setShow('lip-synced-video')}
                  variant={show === 'lip-synced-video' ? 'outline' : 'solid'}
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
            <VideoPlayer url={url} />
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default JobGridItemExpandedModal;
