import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  Heading,
} from '@chakra-ui/react';
import { Edit, Trash2 } from 'lucide-react';
import { CohortView } from '../../types';
import MemberList from '../MemberList';

interface CohortCardProps {
  cohort: CohortView;
  onEdit: (cohort: CohortView) => void;
  onDelete: (cohortId: number) => void;
}

export default function CohortCard({
  cohort,
  onEdit,
  onDelete,
}: CohortCardProps) {
  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      shadow="sm"
      bg="white"
      _hover={{ shadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="md">{cohort.name}</Heading>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit cohort"
              icon={<Edit size={16} />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(cohort)}
            />
            <IconButton
              aria-label="Delete cohort"
              icon={<Trash2 size={16} />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm('Are you sure you want to delete this cohort?')
                ) {
                  onDelete(cohort.id);
                }
              }}
            />
          </HStack>
        </HStack>

        <Box>
          <Text color="gray.600" mb={2}>
            {cohort.members.length} member
            {cohort.members.length !== 1 ? 's' : ''}
          </Text>
          <MemberList members={cohort.members} showPagination={false} />
        </Box>
      </VStack>
    </Box>
  );
}
