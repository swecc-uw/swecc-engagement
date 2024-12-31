import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Textarea,
  VStack,
  Box,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { createReport } from '../services/report';
import { Report, ReportBody, ReportType } from '../types';
import { devPrint } from './utils/RandomUtils';

interface ReportPopUpProps {
  title?: string;
  associatedId: string;
  reporterUserId?: number;
  type: ReportType;
  badgeColorScheme?: string;
  reasonPlaceholder?: string;
  onClose: () => void;
  onSubmit?: (report: ReportBody) => Promise<Report>;
}

const ReportPopUp: React.FC<ReportPopUpProps> = ({
  title = 'Submit Report',
  associatedId,
  reporterUserId,
  type,
  badgeColorScheme = 'red',
  reasonPlaceholder = `Enter reason for reporting this ${type.toLowerCase()}`,
  onSubmit = createReport,
  onClose,
}) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        associatedId,
        reporterUserId,
        type,
        reason,
      });
      toast({
        title: 'Report submitted!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      devPrint('Failed to submit report:', error);
      toast({
        title: 'An error occurred',
        description:
          'There was an error submitting your report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="outline" boxShadow="lg" borderRadius="lg">
      <Box position="relative">
        <Button
          position="absolute"
          top={2}
          right={2}
          onClick={onClose}
          variant="ghost"
          size="sm"
        >
          <CloseIcon />
        </Button>

        <CardHeader pb={0}>
          <Heading size="md" color="blue.600">
            {title}
          </Heading>
          <Badge mt={2} colorScheme={badgeColorScheme} variant="subtle">
            {type}
          </Badge>
        </CardHeader>

        <CardBody maxH="500px">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isDisabled={isLoading}>
                <FormLabel color="gray.700" fontWeight="medium">
                  Reason for Report
                </FormLabel>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={reasonPlaceholder}
                  size="lg"
                  minH="150px"
                  bg="white"
                  border="1px"
                  borderColor="gray.300"
                  _hover={{
                    borderColor: 'blue.400',
                  }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Submitting..."
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
              >
                Submit Report
              </Button>

              <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
                Cancel
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Box>
    </Card>
  );
};

export default ReportPopUp;
