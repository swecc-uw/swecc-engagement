import { useState, useRef, ChangeEvent } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Avatar,
  VStack,
  Input,
  Text,
  useDisclosure,
  Box,
  Image,
  Center,
  Spinner,
  useToast,
  AvatarBadge,
} from '@chakra-ui/react';
import api from '../services/api';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUploadSuccess?: (newImageUrl: string) => void;
}

interface UploadResponse {
  message: string;
  url: string;
  error?: string;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  onUploadSuccess,
}: ProfilePictureUploadProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // validate file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, or GIF image',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setLoading(true);
    const formData = new FormData();
    formData.append('profile_picture', file);

    try {
      const response = await api.post(
        '/members/profile/picture/upload/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data: UploadResponse = response.data;

      if (response.status !== 200) {
        throw new Error(data.error || 'Upload failed');
      }

      if (onUploadSuccess) {
        onUploadSuccess(data.url);
      }

      toast({
        title: 'Success',
        description: 'Profile picture updated',
        status: 'success',
        duration: 3000,
      });

      // close modal after upload
      setTimeout(handleClose, 1000);
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 3000,
      });
      setPreviewUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (): void => {
    setPreviewUrl(null);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Avatar
        size="xl"
        src={currentImageUrl}
        cursor="pointer"
        onClick={onOpen}
        bg="gray.200"
      >
        <AvatarBadge
          bg="gray.100"
          boxSize="1.25em"
          borderColor="white"
          transform="translate(-0.2em, -0.2em)"
        >
          <Text fontSize="xs">✎</Text>
        </AvatarBadge>
      </Avatar>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Profile Picture</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Center
                w="full"
                h="200px"
                borderRadius="md"
                bg="gray.50"
                position="relative"
                overflow="hidden"
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    objectFit="cover"
                    w="full"
                    h="full"
                  />
                ) : (
                  <Box textAlign="center" p={4}>
                    <Text color="gray.500" fontSize="sm">
                      {loading ? 'Uploading...' : 'No image selected'}
                    </Text>
                  </Box>
                )}
                {loading && (
                  <Center
                    position="absolute"
                    top={0}
                    left={0}
                    w="full"
                    h="full"
                    bg="blackAlpha.300"
                  >
                    <Spinner />
                  </Center>
                )}
              </Center>

              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileSelect}
                hidden
                ref={fileInputRef}
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                colorScheme="blue"
                w="full"
                isDisabled={loading}
              >
                {previewUrl ? 'Choose Different Photo' : 'Select Photo'}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
