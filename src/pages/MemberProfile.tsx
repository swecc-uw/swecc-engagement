import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Text, Center, Spinner, Box, Container } from '@chakra-ui/react';
import { Member } from '../types';
import { getMemberById } from '../services/directory';
import { devPrint } from '../components/utils/RandomUtils';
import MemberProfileView from '../components/MemberProfileView';

const MemberProfile: React.FC = () => {
  const { userId } = useParams();
  const [member, setMember] = useState<Member>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!userId) {
        devPrint('No user ID provided in URL');
        setIsLoading(false);
        return;
      }

      let parsedUserId;
      try {
        parsedUserId = parseInt(userId);
      } catch (error) {
        devPrint('Invalid user ID provided in URL');
        setIsLoading(false);
        return;
      }

      try {
        const memberData = await getMemberById(parsedUserId);
        setMember(memberData);
      } catch (error) {
        devPrint('Failed to fetch member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [userId]);

  if (isLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  if (!member) {
    return (
      <Center h="60vh">
        <Text fontSize="xl">Member not found</Text>
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box p={6}>
        <MemberProfileView member={member} />
      </Box>
    </Container>
  );
};

export default MemberProfile;
