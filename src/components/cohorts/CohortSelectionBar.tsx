import {
  Box,
  Text,
  Button,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { Cohort } from './cohortDashboardTypes';
import { memo } from 'react';

interface CohortSelectionBarProps {
  cohorts: Cohort[];
  selectedCohortId: string;
  onCohortSelect: (id: string) => void;
  loading?: boolean;
}

const CohortSelectionBar = ({
  cohorts,
  selectedCohortId,
  onCohortSelect,
  loading,
}: CohortSelectionBarProps) => {
  const buttonHoverBgColor = useColorModeValue('blue.100', 'blue.700');
  const activeButtonBgColor = useColorModeValue('blue.500', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const scrollbarTrackColor = useColorModeValue('gray.100', 'gray.700');
  const scrollbarThumbColor = useColorModeValue('blue.300', 'blue.600');

  const buttonStyles = {
    size: 'md',
    borderRadius: 'md',
    px: 6,
    _active: { opacity: 0.8 },
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  };

  if (loading) {
    return (
      <Box mb={6}>
        <Text fontSize="md" color={textColor} ml={2} textAlign="center">
          ...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      mb={6}
      overflowX="auto"
      pb={2}
      css={{
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          width: '6px',
          backgroundColor: scrollbarTrackColor,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: scrollbarThumbColor,
          borderRadius: '4px',
        },
      }}
    >
      <Wrap spacing={3} justify="center">
        <WrapItem>
          <Button
            {...buttonStyles}
            colorScheme="blue"
            variant={selectedCohortId === 'all' ? 'solid' : 'ghost'}
            onClick={() => onCohortSelect('all')}
            _hover={{
              bg:
                selectedCohortId === 'all'
                  ? activeButtonBgColor
                  : buttonHoverBgColor,
              transform: 'translateY(-2px)',
            }}
            shadow={selectedCohortId === 'all' ? 'md' : 'none'}
          >
            <Text as="span" opacity={selectedCohortId === 'all' ? 1 : 0.8}>
              All Cohorts
            </Text>
          </Button>
        </WrapItem>

        {Array.isArray(cohorts) && cohorts.length > 0 ? (
          cohorts.map((cohort) => (
            <WrapItem key={cohort.id}>
              <Button
                {...buttonStyles}
                colorScheme="blue"
                variant={
                  selectedCohortId === cohort.id.toString() ? 'solid' : 'ghost'
                }
                onClick={() => onCohortSelect(cohort.id.toString())}
                _hover={{
                  bg:
                    selectedCohortId === cohort.id.toString()
                      ? activeButtonBgColor
                      : buttonHoverBgColor,
                  transform: 'translateY(-2px)',
                }}
                shadow={
                  selectedCohortId === cohort.id.toString() ? 'md' : 'none'
                }
              >
                <Text
                  as="span"
                  opacity={selectedCohortId === cohort.id.toString() ? 1 : 0.8}
                >
                  {cohort.name}
                </Text>
              </Button>
            </WrapItem>
          ))
        ) : (
          <WrapItem>
            <Text fontSize="md" color={textColor} ml={2}>
              You are not currently part of any cohorts
            </Text>
          </WrapItem>
        )}
      </Wrap>
    </Box>
  );
};

export default memo(CohortSelectionBar);
