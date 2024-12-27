import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Avatar,
  Stack,
  Center,
  Spinner,
} from '@chakra-ui/react';
import { Member } from '../types';
import { getMemberById } from '../services/directory';
import { devPrint, resolveName } from './utils/RandomUtils';
import { formatDate } from '../localization';

const MemberProfile: React.FC = () => {
  const { userId } = useParams();
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!userId) {
        devPrint('No user ID provided in URL');
        return;
      }

      let parsedUserId;
      try {
        parsedUserId = parseInt(userId);
      } catch (error) {
        devPrint('Invalid user ID provided in URL');
        return;
      }

      const memberData = await getMemberById(parsedUserId);
      setMember(memberData);
    };
    try {
      fetchMember();
    } catch (error) {
      devPrint('Failed to fetch member:', error);
    }
  }, [userId]);

  if (!member) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box p={6} borderRadius="lg" boxShadow="sm">
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <Avatar
            name={resolveName(member)}
            src={member.profilePictureUrl}
            size="2xl"
          />
          <VStack align="start">
            <Heading as="h2" size="lg">
              {member.firstName} {member.lastName}
            </Heading>
            <Text>Username: {member.username}</Text>
            <Text>Email: {member.email}</Text>
            <Text>Major: {member.major}</Text>
            {member.gradDate && (
              <Text>Graduation Date: {formatDate(member.gradDate)}</Text>
            )}
            <Text>Bio: {member.bio}</Text>
            <Text>Location: {member.local}</Text>
            {member.linkedin && (
              <Text>LinkedIn: {member.linkedin.username}</Text>
            )}
            {member.github && <Text>GitHub: {member.github.username}</Text>}
            {member.leetcode && (
              <Text>LeetCode: {member.leetcode.username}</Text>
            )}
          </VStack>
        </Stack>
      </Box>
    </Container>
  );
};

export default MemberProfile;
