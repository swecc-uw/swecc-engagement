import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

interface AuthFormProps {
  isLogin: boolean;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  password: string;
  confirmPassword?: string;
  discordUsername?: string;
  error: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFirstNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDiscordUsernameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  firstName,
  lastName,
  username,
  email,
  password,
  confirmPassword,
  discordUsername,
  error,
  onUsernameChange,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onDiscordUsernameChange,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Username</FormLabel>
          <Input
            colorScheme="brand"
            type="text"
            value={username}
            onChange={onUsernameChange}
            placeholder="Enter your username"
          />
        </FormControl>
        {!isLogin && (
          <>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                colorScheme="brand"
                type="text"
                value={firstName}
                onChange={onFirstNameChange}
                placeholder="Enter your first name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                colorScheme="brand"
                type="text"
                value={lastName}
                onChange={onLastNameChange}
                placeholder="Enter your last name"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                colorScheme="brand"
                type="email"
                value={email}
                onChange={onEmailChange}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Discord Username</FormLabel>
              <Input
                colorScheme="brand"
                type="text"
                value={discordUsername}
                onChange={onDiscordUsernameChange}
                placeholder="Enter your Discord username"
              />
            </FormControl>
          </>
        )}
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              colorScheme="brand"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={onPasswordChange}
              placeholder="Enter your password"
            />
            <InputRightElement>
              <IconButton
                colorScheme="brand"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        {!isLogin && (
          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              colorScheme="brand"
              type="password"
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              placeholder="Confirm your password"
            />
          </FormControl>
        )}
        {error && <Text color="red.500">{error}</Text>}
        <Button type="submit" colorScheme="brand" width="full">
          {isLogin ? 'Login' : 'Register'}
        </Button>
      </VStack>
    </form>
  );
};

export default AuthForm;
