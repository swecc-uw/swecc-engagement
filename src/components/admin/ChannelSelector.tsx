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
import { MultiSelect, Option } from 'chakra-multiselect';

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

  const [selectedChannels, setSelectedChannels] = useState<Partial<Option>[]>(
    []
  );

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
    setSelectedChannels(
      value
        .split(',')
        .filter(Boolean)
        .map((v) => ({ value: v }))
    );
    onChange(value);
  };

  const handleDropdownChange = (e: Option | Option[]) => {
    const selectedOptions = Array.isArray(e) ? e : [e];

    setSelectedChannels(selectedOptions);
    onChange(selectedOptions.map((option) => option.value).join(','));
  };

  const channelIdNameMap = useMemo(() => {
    if (!server) return {};
    const res: any = {};
    for (const channel of server.getAllChannels()) {
      res[channel.id.toString()] = channel.name;
    }
    return res;
  }, [server]);

  const defaultValues = useMemo(() => {
    return value
      .split(',')
      .filter((v) => !!channelIdNameMap[v])
      .map((v) => {
        return channelIdNameMap[v];
      });
  }, [value]);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    if (categoryId) {
      const channelsInCategory =
        server?.getChannelsInCategory(Number(categoryId)) || [];
      setSelectedChannels(
        channelsInCategory.map((v, idx) => {
          return { value: String(v), label: String(v) };
        })
      );
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
        <MultiSelect
          value={selectedChannels}
          label="Select channels"
          onChange={handleDropdownChange}
          defaultValue={defaultValues}
          options={filteredChannels.map((channel) => {
            return { label: channel.label, value: channel.value as string };
          })}
        />
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
