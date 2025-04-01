import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmUWEmail } from '../services/member';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams();

  const toast = useToast();
  const navigate = useNavigate();

  const confirmEmail = async () => {
    try {
      await confirmUWEmail(token!);
      toast({
        title: 'Email confirmed successfully!',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Failed to confirm email.',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
      });
    }
    navigate('/');
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="60vh"
      mb="20vh"
    >
      <Heading mb={4}>Confirm your UW email.</Heading>
      <Button
        backgroundColor="green.500"
        color="white"
        fontSize="lg"
        size="lg"
        p={8}
        onClick={confirmEmail}
        _hover={{ bg: 'green.600' }}
      >
        Confirm Email
      </Button>
    </Flex>
  );
};
