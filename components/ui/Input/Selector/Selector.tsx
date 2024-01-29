import { FC } from 'react';

import { Flex, Text } from '@chakra-ui/react';

const Option = ({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <Flex
      bg={selected ? 'blackAlpha.600' : ''}
      _hover={{
        bg: !selected ? 'whiteAlpha.600' : '',
        color: !selected ? 'black' : ''
      }}
      p={2}
      rounded={'md'}
      w="full"
      justifyContent={'center'}
      cursor={!selected ? 'pointer' : ''}
      onClick={() => onClick()}
    >
      <Text>{label}</Text>
    </Flex>
  );
};

interface Props {
  options: string[];
  selection: string;
  setSelection: (s: string) => void;
}

const Selector: FC<Props> = ({ options, selection, setSelection }) => {
  return (
    <Flex
      w="full"
      bg="whiteAlpha.400"
      p={1}
      rounded={'md'}
      gap={1}
      fontWeight="bold"
    >
      {options.map((option) => (
        <Option
          key={option}
          label={option}
          selected={selection === option}
          onClick={() => setSelection(option)}
        />
      ))}
    </Flex>
  );
};

export default Selector;
