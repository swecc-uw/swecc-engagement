import {
  VStack,
  HStack,
  Button,
  useToast,
  Heading,
  Container,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { deleteCohort, getCohorts } from '../../services/cohort';
import { CohortView } from '../../types';
import CohortCard from '../../components/cohorts/CohortCard';
import { useNavigate } from 'react-router-dom';

export default function CohortDashboard() {
  const [cohorts, setCohorts] = useState<CohortView[]>([]);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchCohorts = async () => {
    try {
      const fetchedCohorts = await getCohorts();
      setCohorts(fetchedCohorts);
    } catch (error) {
      toast({
        title: 'Failed to load cohorts',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchCohorts();
  }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Cohorts</Heading>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/admin/cohorts/create')}
          >
            Create Cohort
          </Button>
        </HStack>

        {cohorts.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={8}>
            No cohorts found. Create one to get started.
          </Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {cohorts.map((cohort) => (
              <CohortCard
                key={cohort.id}
                cohort={cohort}
                onEdit={() => navigate(`/admin/cohorts/edit/${cohort.id}`)}
                onDelete={() => {
                  deleteCohort(cohort.id)
                    .then(() => {
                      fetchCohorts();
                      toast({
                        title: 'Cohort deleted successfully',
                        status: 'success',
                        duration: 3000,
                      });
                    })
                    .catch(() => {
                      toast({
                        title: 'Failed to delete cohort',
                        status: 'error',
                        duration: 3000,
                      });
                    });
                }}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
