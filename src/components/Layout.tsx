import React, { useEffect } from 'react';
import {
  Box,
  Flex,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Center,
  Link as ChakraLink,
  useColorModeValue,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import SWECC_LOGO from '../assets/transp-swecc-logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';
import { Member } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  FaInstagram,
  FaLinkedin,
  FaDiscord,
  FaGithub,
  FaEnvelope,
  FaGlobe,
} from 'react-icons/fa';
import {
  SWECC_INSTAGRAM_LINK,
  SWECC_LINKEDIN_LINK,
  SWECC_DISCORD_LINK,
  SWECC_GITHUB_LINK,
  SWECC_EMAIL_LINK,
  SWECC_WEBSITE_LINK,
} from '../constants';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

interface NavBarProps {
  member?: Member;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
}

const NO_REDIRECT_PATHS = ['/auth', '/join'];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, member, isVerified } = useAuth();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (
      !loading &&
      (!isAuthenticated || !isVerified) &&
      !NO_REDIRECT_PATHS.includes(pathname)
    ) {
      navigate('/auth');
    }
  }, [isAuthenticated, isVerified, loading, navigate, pathname]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <Flex direction="column" minHeight="100vh">
      <Navbar
        member={member}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        isVerified={isVerified}
      />
      <Box as="main" flexGrow={1}>
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};

const Navbar: React.FC<NavBarProps> = ({
  member,
  isAuthenticated,
  isAdmin,
  isVerified,
}) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const NavLinks = () => (
    <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
      {isAuthenticated && isVerified && (
        <>
          <NavLink to="/directory">Directory</NavLink>
          <NavLink to="/stats">Stats</NavLink>
        </>
      )}
      {isAdmin && <NavLink to="/admin">Admin Dashboard</NavLink>}
      {!isAuthenticated && <NavLink to="/join">Join SWECC</NavLink>}
    </HStack>
  );

  return (
    <Box
      as="nav"
      bg="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center" height="60px">
          <Link to="/">
            <ChakraLink
              as="span"
              display="flex"
              alignItems="center"
              onClick={onClose}
              _hover={{ textDecoration: 'none' }}
            >
              <Box height="40px" display="flex" alignItems="center">
                <img
                  src={SWECC_LOGO}
                  alt="SWECC Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: 'brightness(0.6) contrast(1.5)',
                  }}
                />
              </Box>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                fontWeight="bold"
                fontFamily="monospace"
                ml={4}
                display={{ base: 'none', md: 'block' }}
              >
                <em>Engagement</em>
              </Text>
            </ChakraLink>
          </Link>

          <Flex align="center" gap={4}>
            <NavLinks />

            {member && isAuthenticated ? (
              <Button
                colorScheme="brand"
                onClick={() => navigate('/profile')}
                variant="ghost"
                size={{ base: 'sm', md: 'md' }}
              >
                {member.firstName?.length === 0
                  ? 'Complete Profile'
                  : member.firstName}
              </Button>
            ) : (
              <Button
                colorScheme="brand"
                onClick={() => navigate('/auth')}
                size={{ base: 'sm', md: 'md' }}
              >
                Sign in
              </Button>
            )}

            <IconButton
              display={{ base: 'flex', md: 'none' }}
              colorScheme="brand"
              onClick={onOpen}
              icon={<HamburgerIcon />}
              aria-label="Open menu"
              variant="ghost"
              size="md"
            />
          </Flex>
        </Flex>
      </Container>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody pt={4}>
            <VStack align="stretch" spacing={4}>
              {isAuthenticated && isVerified && (
                <>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/directory');
                      onClose();
                    }}
                  >
                    Directory
                  </Button>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => {
                      navigate('/stats');
                      onClose();
                    }}
                  >
                    Stats
                  </Button>
                </>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate('/admin');
                    onClose();
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
              {!isAuthenticated && (
                <Button
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  onClick={() => {
                    navigate('/join');
                    onClose();
                  }}
                >
                  Join SWECC
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => {
  return (
    <Link to={to}>
      <ChakraLink
        as="span"
        px={3}
        py={2}
        rounded="md"
        fontWeight="medium"
        _hover={{
          textDecoration: 'none',
          bg: 'gray.100',
        }}
        display="block"
      >
        {children}
      </ChakraLink>
    </Link>
  );
};
const Footer: React.FC = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const color = useColorModeValue('gray.700', 'gray.200');
  const hoverColor = useColorModeValue('blue.500', 'blue.300');

  const socialLinks = [
    { icon: FaInstagram, href: SWECC_INSTAGRAM_LINK, label: 'Instagram' },
    { icon: FaLinkedin, href: SWECC_LINKEDIN_LINK, label: 'LinkedIn' },
    { icon: FaDiscord, href: SWECC_DISCORD_LINK, label: 'Discord' },
    { icon: FaGithub, href: SWECC_GITHUB_LINK, label: 'GitHub' },
    { icon: FaEnvelope, href: SWECC_EMAIL_LINK, label: 'Email' },
    { icon: FaGlobe, href: SWECC_WEBSITE_LINK, label: 'Website' },
  ];

  return (
    <Box as="footer" bg={bg} color={color} mt="auto">
      <Container maxW="container.xl" py={12}>
        <Flex direction="column" align="center">
          <HStack spacing={6} mb={8}>
            {socialLinks.map((link) => (
              <ChakraLink
                key={link.label}
                href={link.href}
                isExternal
                _hover={{ color: hoverColor }}
                aria-label={link.label}
              >
                <link.icon size={24} />
              </ChakraLink>
            ))}
          </HStack>

          <Text textAlign="center" fontSize="sm">
            © {new Date().getFullYear()} Software Engineering Career Club
            (SWECC). All rights reserved.
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

export default Layout;
