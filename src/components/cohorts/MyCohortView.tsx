import { CohortView } from '../../types';
import MemberList from '../MemberList';
import { Box } from '@chakra-ui/react';

interface MyCohortViewProps {
  cohort?: CohortView;
  heading?: string | JSX.Element;
}

export default function MyCohortView({ cohort, heading }: MyCohortViewProps) {
  console.log(cohort);
  if (!cohort) {
    return null;
  }
  return (
    <Box mt={6}>
      {heading}
      {cohort.members.map((member) => (
        <MemberList key={member.id} members={[member]} showPagination={false} />
      ))}
    </Box>
  );
}
