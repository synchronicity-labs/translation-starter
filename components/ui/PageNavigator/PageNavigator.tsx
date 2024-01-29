import { FC } from 'react';

import { Flex, Text, useMediaQuery } from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

import Button from '../Input/Button';

interface Props {
  offset: number;
  setOffset: (o: number) => void;
  pageSize: number;
  pages: number;
}

const PageNavigator: FC<Props> = ({ offset, setOffset, pageSize, pages }) => {
  const currentPage = offset / pageSize + 1;

  const [isNotMobile] = useMediaQuery('(min-width: 480px)', {
    ssr: true,
    fallback: false // return false on the server, and re-evaluate on the client side
  });

  return (
    <Flex gap={isNotMobile ? '4' : '2'} fontSize="xl" alignItems={'center'}>
      {isNotMobile ? (
        <Button
          leftIcon={<FaAngleLeft />}
          size="sm"
          isDisabled={currentPage === 1}
          onClick={() => setOffset(offset - pageSize)}
        >
          Prev
        </Button>
      ) : (
        <Flex
          cursor={currentPage === 1 ? 'not-allowed' : 'pointer'}
          opacity={currentPage === 1 ? '50%' : '100%'}
        >
          <Flex
            onClick={() => setOffset(offset - pageSize)}
            pointerEvents={currentPage === 1 ? 'none' : 'auto'}
          >
            <FaAngleLeft />
          </Flex>
        </Flex>
      )}
      <Flex alignItems={'center'} gap={2}>
        <Text fontWeight={'bold'} fontSize="sm">
          Page
        </Text>
        <Flex
          minW="50px"
          justifyContent={'center'}
          bgColor="RGBA(0,0,0,0.4)"
          rounded="md"
          p="2"
        >
          <Text fontSize="sm" fontWeight="bold">
            {`${currentPage} / ${pages}`}
          </Text>
        </Flex>
      </Flex>
      {isNotMobile ? (
        <Button
          rightIcon={<FaAngleRight />}
          size="sm"
          isDisabled={currentPage === pages}
          onClick={() => setOffset(offset + pageSize)}
        >
          Next
        </Button>
      ) : (
        <Flex
          cursor={currentPage === pages ? 'not-allowed' : 'pointer'}
          opacity={currentPage === pages ? '50%' : '100%'}
        >
          <Flex
            onClick={() => setOffset(offset + pageSize)}
            pointerEvents={currentPage === 1 ? 'none' : 'auto'}
          >
            <FaAngleRight />
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default PageNavigator;
