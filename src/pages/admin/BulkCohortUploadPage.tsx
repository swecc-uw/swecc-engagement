import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Input,
  Heading,
  useColorModeValue,
  Container,
  Card,
  CardBody,
  CardHeader,
  Button,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { groupBy, sortBy } from 'lodash';
import { useCohortBulkCreate } from '../../hooks/useCohortBulkCreate';

const SchemaHint = () => (
  <Card variant="outline" mb={6}>
    <CardHeader>
      <Text fontSize="lg" fontWeight="medium">
        Schema Requirements
      </Text>
    </CardHeader>
    <CardBody>
      <VStack align="stretch" spacing={3}>
        <Text>Your CSV should follow this format:</Text>
        <Box
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={3}
          borderRadius="md"
          fontWeight="semibold"
        >
          Discord Username, Cohort Name, Level
        </Box>
        <Text fontSize="sm" color="gray.600">
          Example:
        </Text>
        <Box
          fontFamily="mono"
          fontSize="sm"
          bg={useColorModeValue('gray.50', 'gray.700')}
          p={3}
          borderRadius="md"
        >
          elimelt, Cohort 1, beginner
        </Box>
        <Text fontSize="sm" color="gray.500">
          Level must be one of: beginner, intermediate, advanced
        </Text>
      </VStack>
    </CardBody>
  </Card>
);

interface CohortUploadPreviewProps {
  data: {
    discordUsername: string;
    cohortName: string;
    cohortLevel: string;
  }[];
  includesHeaderRow: boolean;
}

const CohortUploadPreview: React.FC<CohortUploadPreviewProps> = ({
  data,
  includesHeaderRow,
}) => {
  const tdBg = useColorModeValue('gray.100', 'gray.600');
  const trBg = useColorModeValue('gray.50', 'gray.700');

  if (!data) return null;

  const displayRows = includesHeaderRow ? data.slice(1) : data;

  if (displayRows.length === 0) {
    return (
      <Card variant="outline" mt={6}>
        <CardBody>
          <HStack spacing={2} color="orange.500">
            <WarningIcon />
            <Text>No valid data found. Please check your CSV format.</Text>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  const groupedRows = groupBy(displayRows, 'cohortName');
  const sortedCohorts = Object.keys(groupedRows).sort();

  return (
    <Card variant="outline" mt={6}>
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">Preview</Heading>
          <Text color="gray.600" fontSize="sm">
            Total entries: {displayRows.length}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr bg={trBg}>
                <Th>Discord Username</Th>
                <Th>Cohort Name</Th>
                <Th>Level</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedCohorts.map((cohortName) => (
                <React.Fragment key={cohortName}>
                  <Tr>
                    <Td colSpan={3} bg={tdBg} fontWeight="bold">
                      <HStack>
                        <Text>{cohortName}</Text>
                        <Text fontSize="sm" color="gray.500">
                          ({groupedRows[cohortName].length} members)
                        </Text>
                      </HStack>
                    </Td>
                  </Tr>
                  {sortBy(groupedRows[cohortName], 'discordUsername').map(
                    (row, index) => (
                      <Tr key={`${cohortName}-${index}`}>
                        <Td pl={8}>{row.discordUsername}</Td>
                        <Td>{row.cohortName}</Td>
                        <Td>
                          <Text
                            color={
                              row.cohortLevel === 'beginner'
                                ? 'green.500'
                                : row.cohortLevel === 'intermediate'
                                ? 'blue.500'
                                : 'purple.500'
                            }
                            fontWeight="medium"
                          >
                            {row.cohortLevel}
                          </Text>
                        </Td>
                      </Tr>
                    )
                  )}
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>
      </CardBody>
    </Card>
  );
};

const BulkCohortUploadPage = () => {
  const [csvData, setCsvData] = useState('');
  const [includesHeaderRow, setIncludesHeaderRow] = useState(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tryBulkCreate, parse, isLoading } = useCohortBulkCreate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result?.toString() || '');
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text');

    const cleanedText = text
      .split('\n')
      .map((row) => row.trim())
      .filter((row) => row.length > 0)
      .join('\n');

    setCsvData(cleanedText);

    if (textAreaRef.current) {
      textAreaRef.current.value = cleanedText;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvData(event.target.value);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!csvData) {
      return;
    }

    tryBulkCreate(csvData, includesHeaderRow);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" mb={2}>
          Bulk Cohort Upload
        </Heading>

        <SchemaHint />

        <Card variant="outline">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <HStack spacing={4} mb={4}>
                  <Checkbox
                    isChecked={includesHeaderRow}
                    onChange={(e) => setIncludesHeaderRow(e.target.checked)}
                    colorScheme="blue"
                  >
                    Includes header row
                  </Checkbox>
                </HStack>
              </Box>

              <Box>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  display="none"
                />
                <Button onClick={triggerFileInput} colorScheme="blue" mb={4}>
                  Choose CSV File
                </Button>

                <Text mb={2} fontWeight="medium">
                  Or paste data here
                </Text>
                <Textarea
                  ref={textAreaRef}
                  onPaste={handlePaste}
                  onChange={handleInputChange}
                  value={csvData}
                  placeholder="Paste your data here..."
                  size="lg"
                  minH="200px"
                  p={4}
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {csvData && (
          <>
            <Button
              colorScheme="blue"
              onClick={() => handleSubmit()}
              isLoading={isLoading}
            >
              Upload Cohorts
            </Button>

            <CohortUploadPreview
              data={parse(csvData, includesHeaderRow)}
              includesHeaderRow={includesHeaderRow}
            />
          </>
        )}
      </VStack>
    </Container>
  );
};

export default BulkCohortUploadPage;
