import { getAllMembers } from '../services/member';
import { createCohort } from '../services/cohort';
import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Member } from '../types';

export function useCohortBulkCreate() {
  const [isLoading, setIsLoading] = useState(false);
  const [membersData, setMembersData] = useState<undefined | Member[]>();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    if (!membersData) {
      const data = await getAllMembers();
      setMembersData(data);
      return data;
    }
    return membersData;
  }, [membersData]);

  function parse(
    data: string,
    includesHeaderRow: boolean
  ): {
    discordUsername: string;
    cohortName: string;
    cohortLevel: string;
  }[] {
    const lines = data.split('\n');
    if (includesHeaderRow) lines.shift();

    const parsed = lines.map((line) => {
      let [discordUsername, cohortName, cohortLevel] = line.split(',');
      [discordUsername, cohortName, cohortLevel] = [
        discordUsername.trim(),
        cohortName.trim(),
        cohortLevel.trim(),
      ];

      return { discordUsername, cohortName, cohortLevel };
    });

    return parsed;
  }

  async function tryBulkCreate(data: string, includesHeaderRow: boolean) {
    setIsLoading(true);
    try {
      const parsed = parse(data, includesHeaderRow);
      const allMembers = await fetchMembers();
      const cohorts: Record<string, { level: string; memberIds: number[] }> = {};

      for (const { discordUsername, cohortName, cohortLevel } of parsed) {
        const member = allMembers.find(
          (m) => m.discordUsername === discordUsername
        );
        if (!member) {
          throw new Error(
            `Member with discord username ${discordUsername} not found`
          );
        }

        if (!cohorts[cohortName]) {
          cohorts[cohortName] = { level: cohortLevel, memberIds: [] };
        }

        cohorts[cohortName].memberIds.push(member.id);
      }

      for (const [name, { level, memberIds }] of Object.entries(cohorts))
        if (!(await createCohort({ name, memberIds, level })))
          throw new Error(`Failed to create cohort ${name}`);

      toast({
        title: 'Success',
        description: 'Cohorts created successfully',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setTimeout(() => {
        navigate('/admin/cohorts');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    members: membersData,
    parse,
    tryBulkCreate,
  };
}
