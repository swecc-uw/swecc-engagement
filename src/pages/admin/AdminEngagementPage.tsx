import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Button, Heading, VStack } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';

interface Props {}

export const AdminEngagementPage: React.FC<Props> = () => {
  return (
    <Box>
      <VStack align={'flex-start'}>
        <Button as={Link} to="/admin" leftIcon={<ArrowBackIcon />} mb={1}>
          Go back
        </Button>
        <Heading>Engagement Metrics</Heading>
      </VStack>
    </Box>
  );
};
