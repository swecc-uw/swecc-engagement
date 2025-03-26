import { CohortView } from '../../types';

import { Box, Heading } from '@chakra-ui/react';
import MyCohortView from './MyCohortView';

interface CohortListPromps {
  cohorts: CohortView[];
}

export default function CohortList({ cohorts }: CohortListPromps) {
  return (
    <Box mt={6} mb={6}>
      <Heading as="h2" size="lg" mb={6}>
        Cohorts
      </Heading>
      {cohorts.map((cohort) => (
        <MyCohortView
          key={cohort.id}
          cohort={cohort}
          heading={
            <Heading as="h3" size="md" mb={4}>
              {cohort.name}
            </Heading>
          }
        />
      ))}
    </Box>
  );
}
