import { FC } from 'react';

import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps
} from '@chakra-ui/react';

interface ButtonProps extends ChakraButtonProps {}

const Button: FC<ButtonProps> = (props: ButtonProps) => {
  return <ChakraButton {...props}></ChakraButton>;
};

export default Button;
