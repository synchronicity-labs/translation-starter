import { FC } from 'react';

import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text
} from '@chakra-ui/react';

import AuthUI from '@/app/signin/AuthUI';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SignUpModal: FC<Props> = ({ isOpen, onClose }) => {
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
        <ModalHeader justifyContent={'center'} alignItems={'center'}>
          <Flex justifyContent={'center'}>
            <Text>Sign up to access video translation</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody bg="blackAlpha.200" rounded="md">
          <AuthUI />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignUpModal;
