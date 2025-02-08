import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  HStack,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  Card,
  CardBody,
  IconButton,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { RefreshCw } from 'lucide-react';
import { Member } from '../../types';
import { getAllMembers } from '../../services/member';
import { createCohort } from '../../services/cohort';

export default function CreateCohortPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [cohortName, setCohortName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (error) {
      toast({
        title: 'Error loading members',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return (
      !searchQuery ||
      fullName.includes(searchLower) ||
      member.username.toLowerCase().includes(searchLower)
    );
  });

  const toggleMember = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cohortName.trim()) {
      toast({
        title: 'Please enter a cohort name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await createCohort({
        name: cohortName.trim(),
        memberIds: selectedMembers,
      });

      toast({
        title: 'Cohort created successfully',
        status: 'success',
        duration: 3000,
      });

      navigate('/cohorts');
    } catch (error) {
      toast({
        title: 'Failed to create cohort',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">Create New Cohort</Heading>
          <Text color="gray.600" mt={2}>
            Create a new cohort and add members to it.
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Cohort Name</FormLabel>
              <Input
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                placeholder="Enter cohort name"
              />
            </FormControl>

            <Box>
              <FormLabel>Select Members</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  flex={1}
                />
                <IconButton
                  aria-label="Refresh member list"
                  icon={isLoading ? <Spinner size="sm" /> : <RefreshCw />}
                  onClick={loadMembers}
                  isDisabled={isLoading}
                />
              </HStack>

              {isLoading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={4}>Loading members...</Text>
                </Box>
              ) : (
                <VStack
                  spacing={3}
                  align="stretch"
                  maxH="400px"
                  overflowY="auto"
                >
                  {filteredMembers.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No members found
                    </Text>
                  ) : (
                    filteredMembers.map((member) => (
                      <Card
                        key={member.id}
                        variant="outline"
                        bg={
                          selectedMembers.includes(member.id)
                            ? 'blue.50'
                            : 'white'
                        }
                      >
                        <CardBody>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {member.firstName} {member.lastName}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                @{member.username}
                              </Text>
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme={
                                selectedMembers.includes(member.id)
                                  ? 'red'
                                  : 'blue'
                              }
                              onClick={() => toggleMember(member.id)}
                            >
                              {selectedMembers.includes(member.id)
                                ? 'Remove'
                                : 'Add'}
                            </Button>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              )}
            </Box>

            <Divider />

            <HStack justify="space-between">
              <Button variant="ghost" onClick={() => navigate('/cohorts')}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isDisabled={!cohortName.trim() || selectedMembers.length === 0}
              >
                Create Cohort
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
}
