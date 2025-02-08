import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  createCohort,
  updateCohort,
  getCohortById,
} from '../../services/cohort';

export default function CreateUpdateCohortPage() {
  const navigate = useNavigate();
  const { id: cohortId } = useParams();
  console.log('Editing cohort with ID:', cohortId);
  const toast = useToast();
  const isEditMode = Boolean(cohortId);

  const [formState, setFormState] = useState({
    name: '',
    memberIds: [] as number[],
    isLoading: false,
    isSaving: false,
  });

  const [memberState, setMemberState] = useState({
    members: [] as Member[],
    isLoading: false,
    searchQuery: '',
  });

  useEffect(() => {
    async function loadCohort() {
      if (!isEditMode) return;

      setFormState((prev) => ({ ...prev, isLoading: true }));
      try {
        const cohortIdNum = parseInt(cohortId!);
        const cohort = await getCohortById(cohortIdNum!);
        setFormState((prev) => ({
          ...prev,
          name: cohort.name,
          memberIds: cohort.members.map((m) => m.id),
          isLoading: false,
        }));
      } catch (error) {
        console.error('Failed to load cohort:', error);
        toast({
          title: 'Error loading cohort',
          status: 'error',
          duration: 3000,
        });
        navigate('/admin/cohorts');
      }
    }

    loadCohort();
  }, [cohortId, isEditMode, navigate, toast]);

  const loadMembers = async () => {
    setMemberState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await getAllMembers();
      setMemberState((prev) => ({
        ...prev,
        members: data,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load members:', error);
      toast({
        title: 'Error loading members',
        status: 'error',
        duration: 3000,
      });
      setMemberState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = memberState.members
    .filter((member) => {
      const searchLower = memberState.searchQuery.toLowerCase();
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return (
        !memberState.searchQuery ||
        fullName.includes(searchLower) ||
        member.username.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aToggled = formState.memberIds.includes(a.id);
      const bToggled = formState.memberIds.includes(b.id);
      if (aToggled === bToggled) {
        return a.firstName.localeCompare(b.firstName);
      }
      return aToggled ? -1 : 1;
    });

  const toggleMember = (memberId: number) => {
    setFormState((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter((id) => id !== memberId)
        : [...prev.memberIds, memberId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      toast({
        title: 'Please enter a cohort name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setFormState((prev) => ({ ...prev, isSaving: true }));
    try {
      const cohortData = {
        name: formState.name.trim(),
        memberIds: formState.memberIds,
      };

      if (isEditMode) {
        await updateCohort({
          id: parseInt(cohortId!),
          ...cohortData,
        });
      } else {
        await createCohort(cohortData);
      }

      toast({
        title: `Cohort ${isEditMode ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 3000,
      });

      navigate('/admin/cohorts');
    } catch (error) {
      console.error('Failed to save cohort:', error);
      toast({
        title: `Failed to ${isEditMode ? 'update' : 'create'} cohort`,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setFormState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  if (formState.isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
          <Text mt={4}>Loading cohort data...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg">
            {isEditMode ? 'Edit Cohort' : 'Create New Cohort'}
          </Heading>
          <Text color="gray.600" mt={2}>
            {isEditMode
              ? 'Update cohort details and members.'
              : 'Create a new cohort and add members to it.'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Cohort Name</FormLabel>
              <Input
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter cohort name"
              />
            </FormControl>

            <Box>
              <FormLabel>Select Members</FormLabel>
              <HStack mb={4}>
                <Input
                  placeholder="Search members..."
                  value={memberState.searchQuery}
                  onChange={(e) =>
                    setMemberState((prev) => ({
                      ...prev,
                      searchQuery: e.target.value,
                    }))
                  }
                  flex={1}
                />
                <IconButton
                  aria-label="Refresh member list"
                  icon={
                    memberState.isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <RefreshCw />
                    )
                  }
                  onClick={loadMembers}
                  isDisabled={memberState.isLoading}
                />
              </HStack>

              {memberState.isLoading ? (
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
                          formState.memberIds.includes(member.id)
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
                                formState.memberIds.includes(member.id)
                                  ? 'red'
                                  : 'blue'
                              }
                              onClick={() => toggleMember(member.id)}
                            >
                              {formState.memberIds.includes(member.id)
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
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/cohorts')}
                isDisabled={formState.isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={formState.isSaving}
                isDisabled={
                  !formState.name.trim() || formState.memberIds.length === 0
                }
              >
                {isEditMode ? 'Update Cohort' : 'Create Cohort'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
}
