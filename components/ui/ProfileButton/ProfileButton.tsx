'use client';

import SignOutButton from './SignOutButton';
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  Stack,
  useDisclosure,
  Text,
  Divider,
  useMediaQuery
} from '@chakra-ui/react';
import { User } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { FC } from 'react';
import { FaDollarSign, FaChartBar, FaSlack, FaBook } from 'react-icons/fa';
import { MdPerson } from 'react-icons/md';

interface Props {
  user: User;
}

const tabs: any[] = [
  {
    label: 'Subscription',
    icon: <FaDollarSign />,
    route: '/subscription',
    showOnMobile: true,
    showOnWeb: true
  },
  {
    label: 'Usage',
    icon: <FaChartBar />,
    route: '/usage',
    showOnMobile: true,
    showOnWeb: true
  },
  {
    label: 'Docs',
    icon: <FaBook />,
    route: 'https://docs.synclabs.so/',
    showOnMobile: true,
    showOnWeb: false
  },
  {
    label: 'Slack',
    icon: <FaSlack />,
    route:
      'https://syncbetatesters.slack.com/join/shared_invite/zt-23592cxxg-sTjaMTkk2DO5yUcixzRWZg#/shared-invite/email',
    showOnMobile: true,
    showOnWeb: false
  }
];

const Tab = ({
  label,
  icon,
  route
}: {
  label: string;
  icon: JSX.Element;
  route: string;
}) => {
  const router = useRouter();
  const onPath = usePathname() === route;
  return (
    <Flex
      alignItems="center"
      gap={'2'}
      py="1"
      px="2"
      rounded="md"
      color={onPath ? '' : 'blackAlpha.600'}
      _hover={
        onPath
          ? {
              bg: 'blackAlpha.200',
              cursor: 'pointer'
            }
          : {
              color: 'blackAlpha.800',
              bg: 'blackAlpha.200',
              cursor: 'pointer'
            }
      }
      onClick={() => {
        router.push(route);
      }}
    >
      {icon}
      <Text fontWeight="bold">{label}</Text>
    </Flex>
  );
};

const ProfileButton: FC<Props> = ({ user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isMobile] = useMediaQuery('(max-width: 479px)', {
    ssr: true,
    fallback: false
  });

  return (
    <Flex className="relative">
      <Flex
        w={8}
        aspectRatio={1 / 1}
        justifyContent={'center'}
        alignItems={'center'}
        rounded="full"
        bg="whiteAlpha.400"
        cursor={'pointer'}
        onClick={isOpen ? onClose : onOpen}
        fontSize="xl"
      >
        <MdPerson color="white" />
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent
          position="fixed"
          top={0}
          right={0}
          mx={7}
          my={20}
          w={250}
          py={2}
          rounded={10}
          bgColor={'#EDEDD'}
          color={'#181818'}
          boxShadow="outline"
        >
          <ModalBody>
            <Flex>
              <Stack w="full">
                <Box py={2}>
                  <Text fontWeight="bold">{`${user.email as string}`}</Text>
                </Box>
                <Divider borderColor={'#181818'} border={'10'} />
                <Stack py="1">
                  {isMobile
                    ? tabs
                        .filter((tab) => tab.showOnMobile)
                        .map(({ label, icon, route }) => (
                          <Tab
                            key={label}
                            label={label}
                            icon={icon}
                            route={route}
                          />
                        ))
                    : tabs
                        .filter((tab) => tab.showOnWeb)
                        .map(({ label, icon, route }) => (
                          <Tab
                            key={label}
                            label={label}
                            icon={icon}
                            route={route}
                          />
                        ))}
                </Stack>
                <SignOutButton />
              </Stack>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ProfileButton;
