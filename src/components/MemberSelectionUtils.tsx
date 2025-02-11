// Components.tsx
import { CohortView, Member } from '../types';
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Select,
  Heading,
} from '@chakra-ui/react';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getCohorts } from '../services/cohort';
import { useNavigate } from 'react-router-dom';

interface MemberViewProps {
  member: Member;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onTransfer: (memberId: number) => (toCohort: number) => Promise<void>;
}

export const MemberView: React.FC<MemberViewProps> = ({
  member,
  isSelected,
  onToggle,
  onDelete,
  onTransfer,
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
        <VStack>
          <Button
            size="sm"
            colorScheme={isSelected ? 'red' : 'blue'}
            onClick={() => onToggle(member.id)}
            w="100%"
          >
            {isSelected ? 'Remove' : 'Add'}
          </Button>
          {isSelected && (
            <>
              <Button
                onClick={() => {
                  onDelete(member.id);
                }}
                w="100%"
                size="sm"
              >
                Delete
              </Button>
              <TransferCohortModal onTransfer={onTransfer(member.id)} />
            </>
          )}
        </VStack>
      </HStack>
    </CardBody>
  </Card>
);

interface MemberSelectionProps {
  members: Member[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  onTransfer: (memberId: number) => (toCohort: number) => Promise<void>;
}

export const MemberSelection: React.FC<MemberSelectionProps> = ({
  members,
  selectedIds,
  onToggle,
  isLoading,
  onDelete,
  onTransfer,
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
          onDelete={onDelete}
          onTransfer={onTransfer}
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

interface TransferCohortModalProps {
  onTransfer: (toCohort: number) => Promise<void>;
}

const TransferCohortModal: React.FC<TransferCohortModalProps> = ({
  onTransfer,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [cohorts, setCohorts] = useState<CohortView[]>([]);
  const selectionRef = useRef<HTMLSelectElement>(null);

  const toast = useToast();
  const navigate = useNavigate();

  const loadCohorts = async () => {
    try {
      setCohorts(await getCohorts());
    } catch (error) {
      toast({
        title: 'Failed to load cohorts',
        status: 'error',
        duration: 3000,
        description: (error as Error).message,
      });
    }
  };

  const submit = async () => {
    await onTransfer(parseInt(selectionRef.current!.value));
    // Refresh page
    navigate(0);
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen}>
        Transfer Cohort
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Transfer Cohort</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading fontSize="medium" mb={2}>
              Select Cohort
            </Heading>
            <Select ref={selectionRef}>
              {cohorts.map((cohort, idx) => {
                return (
                  <option value={cohort.id} key={idx}>
                    {cohort.name}
                  </option>
                );
              })}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              backgroundColor="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              onClick={() => {
                submit();
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
