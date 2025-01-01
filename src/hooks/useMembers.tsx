import { useEffect, useState } from 'react';
import { Member } from '../types';
import { useToast } from '@chakra-ui/react';
import { getAllMembers } from '../services/member';
import { Option } from 'chakra-multiselect';

export const useMembers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [members, setMembers] = useState<Member[]>([]);

  const toast = useToast();

  const fetchMembers = async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (e) {
      const errorMessage = (e as Error).message;
      setError(errorMessage);
      toast({
        status: 'error',
        duration: 5000,
        isClosable: true,
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const options: Option[] = members.map((member, idx) => {
    return {
      label: member.username,
      value: member.id.toString(),
    };
  });

  return { isLoading, error, members, options };
};
