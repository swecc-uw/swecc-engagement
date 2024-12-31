import { Badge } from '@chakra-ui/react';
import React from 'react';

interface Props {
  expires: Date;
}

export const SessionStatus: React.FC<Props> = ({ expires }) => {
  const isExpired = new Date() > expires;

  return (
    <>
      {isExpired ? (
        <Badge colorScheme="gray">Inactive</Badge>
      ) : (
        <Badge colorScheme="green">Active</Badge>
      )}
    </>
  );
};
