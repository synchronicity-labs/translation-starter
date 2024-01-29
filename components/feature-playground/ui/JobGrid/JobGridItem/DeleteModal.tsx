import { useState } from 'react';

import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast
} from '@chakra-ui/react';

const DeleteModal = ({
  jobId,
  isOpen,
  onClose
}: {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // GQL Mutations
  // const [updateJob, { loading }] = useUpdateJobMutation();

  const handleDeleteJob = async () => {
    try {
      setLoading(true);
      await fetch('/api/db/update-job', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          updatedFields: {
            is_deleted: true
          }
        })
      });

      setLoading(false);
      onClose();
      toast({
        title: 'Video Deleted',
        description: 'You successfully deleted your video.',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } catch (err) {
      setLoading(false);
      console.error('GraphQL error:', err);
      toast({
        title: 'Error deleting video',
        description:
          'Incountered error while deleting your video. Please try again.',
        status: 'error',
        duration: 2000,
        isClosable: true
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bgColor={'#D1D1D1'} color="#181818">
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            This will permanently delete this video. This action is not
            reversible.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Flex gap={4}>
            <Button onClick={() => onClose()}>Close</Button>
            <Button
              onClick={handleDeleteJob}
              isLoading={loading}
              loadingText={'Deleting'}
            >
              Permenantly Delete
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;
