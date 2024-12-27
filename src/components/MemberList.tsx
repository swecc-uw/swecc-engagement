import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
  ButtonGroup,
  Center,
} from '@chakra-ui/react';
import { Github, Linkedin, Code2 } from 'lucide-react';
import { Member } from '../types';
import { resolveName } from './utils/RandomUtils';
import { START_PAGE } from '../pages/DirectoryPage';
import { GITHUB_PROFILE_BASE_URL, LEETCODE_API_BASE_URL, LINKEDIN_PROFILE_BASE_URL } from '../constants';

interface MemberListProps {
  members: Member[];
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
}

const MemberCard = ({ member }: { member: Member }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.400');

  const fullName = resolveName(member);

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
      minH="140px"
      w="100%"
    >
      <HStack spacing={4} align="start" h="100%">
        <Avatar size="lg" name={fullName} src={member.profilePictureUrl} />
        <Box flex="1">
          <Flex justify="space-between" align="start">
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                {fullName}
              </Text>
              <Text color="gray.500" fontSize="sm">
                @{member.username}
              </Text>
              {member.major && (
                <Text color="gray.600" fontSize="sm" mt={1}>
                  {member.major}
                </Text>
              )}
            </Box>

            <HStack spacing={2}>
              {member.github?.username && (
                <Tooltip label="GitHub Profile">
                  <IconButton
                    as="a"
                    href={`${GITHUB_PROFILE_BASE_URL}${member.github.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    icon={<Github size={20} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                  />
                </Tooltip>
              )}

              {member.linkedin?.username && (
                <Tooltip label="LinkedIn Profile">
                  <IconButton
                    as="a"
                    href={`${LINKEDIN_PROFILE_BASE_URL}${member.linkedin.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    icon={<Linkedin size={20} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                  />
                </Tooltip>
              )}

              {member.leetcode?.username && (
                <Tooltip label="LeetCode Profile">
                  <IconButton
                    as="a"
                    href={`${LEETCODE_API_BASE_URL}${member.leetcode.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LeetCode Profile"
                    icon={<Code2 size={20} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                  />
                </Tooltip>
              )}
            </HStack>
          </Flex>

          <Box mt={4}>
            <Link to={`/directory/${member.id}`}>
              <Button size="sm" colorScheme="brand">
                View Profile
              </Button>
            </Link>
          </Box>
        </Box>
      </HStack>
    </Box>
  );
};

const LoadingCard = () => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      minH="140px"
      w="100%"
    >
      <HStack spacing={4} align="start">
        <SkeletonCircle size="16" />
        <Box flex="1">
          <Skeleton height="24px" width="200px" mb={2} />
          <Skeleton height="20px" width="150px" mb={4} />
          <Skeleton height="32px" width="100px" />
        </Box>
      </HStack>
    </Box>
  );
};

const MemberList: React.FC<MemberListProps> = ({
  members,
  loading = false,
  currentPage = START_PAGE,
  totalPages = 1,
  showPagination = true,
  onPageChange,
}) => {
  // show loading state with same number of cards as current results
  // or at least 3 if there are no results yet
  const skeletonCount = loading ? Math.max(members.length, 3) : 0;

  return (
    <VStack spacing={6} align="stretch">
      {loading ? (
        <VStack spacing={4} align="stretch">
          {[...Array(skeletonCount)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </VStack>
      ) : members.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </VStack>
      ) : (
        <Center p={8}>
          <Text color="gray.500">No members found</Text>
        </Center>
      )}

      {showPagination && totalPages > 1 && (
        <Flex justify="center" mt={6}>
          <ButtonGroup spacing={4} alignItems="center">
            <Button
              onClick={() => onPageChange?.(currentPage - 1)}
              isDisabled={currentPage === START_PAGE}
              colorScheme="brand"
              variant="outline"
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => onPageChange?.(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              colorScheme="brand"
              variant="outline"
            >
              Next
            </Button>
          </ButtonGroup>
        </Flex>
      )}
    </VStack>
  );
};

export default MemberList;
