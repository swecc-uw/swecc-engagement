import { extendTheme } from '@chakra-ui/react';
import { theme as baseTheme } from '@saas-ui/theme-glass';
import { MultiSelectTheme } from 'chakra-multiselect';

export const theme = extendTheme(
  {
    components: {
      MultiSelect: MultiSelectTheme,
    },
  },
  baseTheme
);
