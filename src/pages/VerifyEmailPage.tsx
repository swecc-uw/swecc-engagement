import { Button, Flex, Heading, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmUWEmail } from '../services/member';

const VerifyEmailPage: React.FC = () => {
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
        title: 'Failed to confirm email. Try re-verifying.',
        status: 'error',
        duration: 5000,
      });
    }
    navigate('/');
  };

  // Verification is handled in the server
  const decodeTokenWithoutVerification = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      const decodedPayload = JSON.parse(atob(parts[1]));
      const decodedEmail = decodedPayload.email;
      if (!decodedEmail) {
        throw new Error('Invalid JWT payload');
      }
      return decodedEmail;
    } catch (error) {
      navigate('/');
      toast({
        title: 'Failed to confirm email. Try re-verifying.',
        status: 'error',
        duration: 5000,
      });

      return null;
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="60vh"
      mb="20vh"
    >
      <Heading mb={4}>
        Confirm your UW Email is {decodeTokenWithoutVerification(token!)}
      </Heading>
      <Button
        backgroundColor="green.500"
        color="white"
        fontSize="lg"
        size="lg"
        p={5}
        onClick={confirmEmail}
        _hover={{ bg: 'green.600' }}
      >
        Confirm Email
      </Button>
    </Flex>
  );
};

export default VerifyEmailPage;
