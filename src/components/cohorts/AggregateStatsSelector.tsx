import {
  Box,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { memo } from 'react';
import { AggregateType } from './cohortDashboardTypes';

interface AggregateStatsSelectorProps {
  selectedAggregateType: AggregateType;
  onAggregateTypeChange: (type: AggregateType) => void;
}

const AggregateStatsSelector = ({
  selectedAggregateType,
  onAggregateTypeChange,
}: AggregateStatsSelectorProps) => {
  const tabHoverBgColor = useColorModeValue('blue.50', 'blue.800');
  const selectionColor = useColorModeValue('black', 'white');

  const tooltips = {
    total: 'Sum of all values across cohorts',
    average: 'Average values across all members',
    max: 'Maximum values across all members',
  };

  return (
    <Box mb={6}>
      <Tabs
        variant="soft-rounded"
        colorScheme="blue"
        size="sm"
        onChange={(index) => {
          const types: AggregateType[] = ['total', 'average', 'max'];
          onAggregateTypeChange(types[index]);
        }}
        index={['total', 'average', 'max'].indexOf(selectedAggregateType)}
      >
        <TabList justifyContent="center" gap={2}>
          <Tooltip label={tooltips.total} hasArrow>
            <Tab
              _hover={{ bg: tabHoverBgColor }}
              _selected={{ boxShadow: 'md' }}
              transition="all 0.2s"
              color={selectionColor}
              isDisabled={selectedAggregateType === 'total'}
            >
              Total Stats
            </Tab>
          </Tooltip>
          <Tooltip label={tooltips.average} hasArrow>
            <Tab
              _hover={{ bg: tabHoverBgColor }}
              _selected={{ boxShadow: 'md' }}
              transition="all 0.2s"
              color={selectionColor}
              isDisabled={selectedAggregateType === 'average'}
            >
              Average Stats
            </Tab>
          </Tooltip>
          <Tooltip label={tooltips.max} hasArrow>
            <Tab
              _hover={{ bg: tabHoverBgColor }}
              _selected={{ boxShadow: 'md' }}
              transition="all 0.2s"
              color={selectionColor}
              isDisabled={selectedAggregateType === 'max'}
            >
              Max Stats
            </Tab>
          </Tooltip>
        </TabList>
      </Tabs>
    </Box>
  );
};

export default memo(AggregateStatsSelector);
