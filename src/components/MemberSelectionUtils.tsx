// Components.tsx
import { Member } from '../types';
import {
  VStack,
  HStack,
  Box,
  Text,
  Card,
  CardBody,
  Button,
  Spinner,
  IconButton,
  Input,
} from '@chakra-ui/react';
import { RefreshCw } from 'lucide-react';

interface MemberViewProps {
  member: Member;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export const MemberView: React.FC<MemberViewProps> = ({
  member,
  isSelected,
  onToggle,
}) => (
  <Card variant="outline" bg={isSelected ? 'blue.50' : 'white'}>
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
          colorScheme={isSelected ? 'red' : 'blue'}
          onClick={() => onToggle(member.id)}
        >
          {isSelected ? 'Remove' : 'Add'}
        </Button>
      </HStack>
    </CardBody>
  </Card>
);

interface MemberSelectionProps {
  members: Member[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  isLoading: boolean;
}

export const MemberSelection: React.FC<MemberSelectionProps> = ({
  members,
  selectedIds,
  onToggle,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading members...</Text>
      </Box>
    );
  }

  if (members.length === 0) {
    return (
      <Text color="gray.500" textAlign="center" py={4}>
        No members found
      </Text>
    );
  }

  return (
    <VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
      {members.map((member) => (
        <MemberView
          key={member.id}
          member={member}
          isSelected={selectedIds.includes(member.id)}
          onToggle={onToggle}
        />
      ))}
    </VStack>
  );
};

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onRefresh,
  isLoading,
}) => (
  <HStack mb={4}>
    <Input
      placeholder="Search members..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      flex={1}
    />
    <IconButton
      aria-label="Refresh member list"
      icon={isLoading ? <Spinner size="sm" /> : <RefreshCw />}
      onClick={onRefresh}
      isDisabled={isLoading}
    />
  </HStack>
);
