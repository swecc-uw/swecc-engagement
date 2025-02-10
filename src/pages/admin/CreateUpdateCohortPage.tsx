import {
  Spinner,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Divider,
  HStack,
  Button,
  Container,
  Box,
  Text,
  Heading,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCohortForm } from '../../hooks/useCohortForm';
import {
  SearchBar,
  MemberSelection,
} from '../../components/MemberSelectionUtils';
import { removeFromCohort, transferToChort } from '../../services/cohort';

export default function CreateUpdateCohortPage() {
  const { id: cohortId } = useParams();
  const {
    formState,
    memberState,
    filteredMembers,
    isEditMode,
    toggleMember,
    handleSubmit,
    updateName,
    updateSearchQuery,
    loadMembers,
  } = useCohortForm(cohortId);
  const navigate = useNavigate();

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

  const handleRemoval = async (memberId: number) => {
    await removeFromCohort(parseInt(cohortId!), memberId);
    toggleMember(memberId);
  };

  // I know this looks hella weird but it's pretty clean I think
  const onTransfer = (cohortId: number) => {
    return (memberId: number) => {
      return async (toCohort: number) => {
        await transferToChort(cohortId, toCohort, memberId);
      };
    };
  };

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
                onChange={(e) => updateName(e.target.value)}
                placeholder="Enter cohort name"
              />
            </FormControl>

            <Box>
              <FormLabel>Select Members</FormLabel>
              <SearchBar
                value={memberState.searchQuery}
                onChange={updateSearchQuery}
                onRefresh={loadMembers}
                isLoading={memberState.isLoading}
              />

              <MemberSelection
                members={filteredMembers}
                selectedIds={formState.memberIds}
                onToggle={toggleMember}
                isLoading={memberState.isLoading}
                onDelete={(memberId) => {
                  const answer = window.confirm(
                    'Are you sure you want to delete this member from this cohort?'
                  );
                  if (!answer) return;
                  handleRemoval(memberId);
                }}
                onTransfer={onTransfer(parseInt(cohortId!))}
              />
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
                  !isEditMode &&
                  (!formState.name.trim() || formState.memberIds.length === 0)
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
