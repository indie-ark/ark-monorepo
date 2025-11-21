import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

interface ImageInputOptionsProps {
  onImageSelect: (imageUri: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const ImageInputOptions: React.FC<ImageInputOptionsProps> = ({ onImageSelect }) => {
  const validateAndSelectImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Check file size if available
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Toast.show({
          type: 'error',
          text1: 'File too large',
          text2: 'Please select an image under 10MB',
        });
        return;
      }

      // Validate file type
      const uri = asset.uri;
      const extension = uri.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'bmp', 'webp'];

      if (!extension || !validExtensions.includes(extension)) {
        Toast.show({
          type: 'error',
          text1: 'Invalid file type',
          text2: 'Please select a JPEG, PNG, BMP, or WebP image',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Image selected',
        text2: 'Ready to process',
      });

      onImageSelect(uri);
    }
  };

  const handleCamera = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      await validateAndSelectImage(result);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Camera error',
        text2: 'Failed to open camera',
      });
    }
  };

  const handleGallery = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select images. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      await validateAndSelectImage(result);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gallery error',
        text2: 'Failed to open photo library',
      });
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-6 bg-background">
      <View className="w-full max-w-md space-y-6">
        <View className="mb-8">
          <Text className="text-3xl font-semibold text-foreground text-center mb-3">
            Chronoperates
          </Text>
          <Text className="text-base text-muted-foreground text-center">
            Extract calendar events from images
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleCamera}
          className="bg-primary py-4 px-6 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground text-center text-base font-medium">
            📷 Take Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGallery}
          className="bg-secondary py-4 px-6 rounded-lg active:opacity-80"
        >
          <Text className="text-secondary-foreground text-center text-base font-medium">
            🖼️ Choose from Gallery
          </Text>
        </TouchableOpacity>

        <View className="mt-8 px-4">
          <Text className="text-sm text-muted-foreground text-center">
            Supported formats: JPEG, PNG, BMP, WebP
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-1">
            Maximum size: 10MB
          </Text>
        </View>
      </View>
    </View>
  );
};
