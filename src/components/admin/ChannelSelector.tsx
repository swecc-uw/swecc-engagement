import React, { useState, useMemo } from 'react';
import {
  Select,
  Stack,
  Text,
  Input,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { DiscordServer } from '../../types';

interface ChannelSelectorProps {
  server: DiscordServer | null;
  value: string;
  onChange: (value: string) => void;
}

export function ChannelSelector({
  server,
  value,
  onChange,
}: ChannelSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<
    'manual' | 'dropdown' | 'category'
  >('dropdown');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const initialChannels = useMemo(
    () => value.split(',').filter(Boolean),
    [value]
  );
  const [selectedChannels, setSelectedChannels] =
    useState<string[]>(initialChannels);

  const categories = useMemo(() => {
    if (!server) return [];
    return server.getAllCategories().map((id) => ({
      value: id.toString(),
      label: server.getCategoryName(id) || 'Unnamed Category',
    }));
  }, [server]);

  const channels = useMemo(() => {
    if (!server) return [];
    return server
      .getAllChannels()
      .filter((channel) => channel.type !== 'CATEGORY')
      .map((channel) => ({
        value: channel.id.toString(),
        label: channel.name || 'Unnamed Channel',
        categoryId: channel.categoryId?.toString(),
      }));
  }, [server]);

  const filteredChannels = useMemo(() => {
    if (selectionMode !== 'category' || !selectedCategory) return channels;
    return channels.filter(
      (channel) => channel.categoryId === selectedCategory
    );
  }, [channels, selectionMode, selectedCategory]);

  const handleModeChange = (mode: typeof selectionMode) => {
    setSelectionMode(mode);
    setSelectedChannels([]);
    setSelectedCategory('');
    onChange('');
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSelectedChannels(value.split(',').filter(Boolean));
    onChange(value);
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedChannels(selected);
    onChange(selected.join(','));
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    if (categoryId) {
      const channelsInCategory =
        server?.getChannelsInCategory(Number(categoryId)) || [];
      setSelectedChannels(channelsInCategory.map(String));
      onChange(channelsInCategory.join(','));
    } else {
      setSelectedChannels([]);
      onChange('');
    }
  };

  return (
    <Stack spacing={4}>
      <ButtonGroup size="sm" isAttached variant="outline">
        <Button
          colorScheme={selectionMode === 'manual' ? 'blue' : 'gray'}
          onClick={() => handleModeChange('manual')}
        >
          Manual Input
        </Button>
        <Button
          colorScheme={selectionMode === 'dropdown' ? 'blue' : 'gray'}
          onClick={() => handleModeChange('dropdown')}
        >
          Channel Select
        </Button>
        <Button
          colorScheme={selectionMode === 'category' ? 'blue' : 'gray'}
          onClick={() => handleModeChange('category')}
        >
          Category Select
        </Button>
      </ButtonGroup>

      {selectionMode === 'manual' && (
        <Input
          placeholder="Enter channel IDs (comma-separated)"
          value={value}
          onChange={handleManualInput}
        />
      )}

      {selectionMode === 'dropdown' && (
        <Select
          placeholder="Select channels"
          multiple={true}
          value={selectedChannels}
          onChange={handleDropdownChange}
          size="md"
          height={40}
        >
          {filteredChannels.map((channel) => (
            <option key={channel.value} value={channel.value}>
              {channel.label}
            </option>
          ))}
        </Select>
      )}

      {selectionMode === 'category' && (
        <Stack spacing={2}>
          <Select
            placeholder="Select a category"
            value={selectedCategory}
            onChange={handleCategorySelect}
            size="md"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
          {selectedCategory && (
            <Text fontSize="sm" color="gray.500">
              Selected {selectedChannels.length} channels
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}
