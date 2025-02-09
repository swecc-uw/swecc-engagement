import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Button,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { List, Terminal, Cast, PencilRuler } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  primaryAction: {
    label: string;
    to: string;
  };
  secondaryActions?: Array<{
    label: string;
    to: string;
  }>;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryActions,
}) => (
  <Card height="full">
    <CardHeader>
      <VStack align="start" spacing={4}>
        <Icon as={icon} boxSize={6} />
        <Heading size="md">{title}</Heading>
      </VStack>
    </CardHeader>
    <CardBody>
      <Text color="gray.600">{description}</Text>
    </CardBody>
    <CardFooter>
      <VStack width="full" spacing={2}>
        <Button
          as={Link}
          to={primaryAction.to}
          colorScheme="blue"
          width="full"
          leftIcon={<Icon as={List} />}
        >
          {primaryAction.label}
        </Button>
        {secondaryActions?.map((action, index) => (
          <Button
            key={index}
            as={Link}
            to={action.to}
            variant="outline"
            width="full"
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </CardFooter>
  </Card>
);

export default function AdminDashboard() {
  const sections: AdminCardProps[] = [
    {
      title: 'Utils',
      description: 'Miscellaneous utilities',
      icon: Terminal,
      secondaryActions: [
        {
          label: 'View Protected Page',
          to: '/protected',
        },
      ],
      primaryAction: {
        label: 'Open API Client',
        to: '/admin/api-client',
      },
    },
    {
      title: 'Admin Console',
      description: 'Access the admin console',
      icon: List,
      primaryAction: {
        label: 'Open Console',
        to: '/admin/console',
      },
    },
    {
      title: 'Manage Sessions',
      description: 'View and manage user sessions',
      icon: Cast,
      primaryAction: {
        label: 'View Sessions',
        to: '/admin/sessions',
      },
    },
    {
      title: 'Engagement Metrics',
      description: 'View engagement metrics for meetings',
      icon: PencilRuler,
      primaryAction: {
        label: 'View Metrics',
        to: '/admin/attendance',
      },
    },
    {
      title: 'Discord Engagement',
      description: 'View Discord engagement metrics',
      icon: FaDiscord,
      primaryAction: {
        label: 'View Engagement',
        to: '/admin/discord',
      },
    },
    {
      title: 'Manage Cohorts',
      description: 'View and manage cohorts',
      icon: List,
      primaryAction: {
        label: 'View Cohorts',
        to: '/admin/cohorts',
      },
      secondaryActions: [
        {
          label: 'Create Cohort',
          to: '/admin/cohorts/create',
        },
      ],
    },
  ];

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={8}>
        <Heading size="lg">Admin Dashboard</Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {sections.map((section, index) => (
            <AdminCard key={index} {...section} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
