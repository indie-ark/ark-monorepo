import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';

interface ImagePreviewProps {
  imageUri: string;
  onProcess: () => void;
  onChangeImage: () => void;
  isProcessing: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUri,
  onProcess,
  onChangeImage,
  isProcessing,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth - 48; // Padding on both sides
  const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

  return (
    <View className="flex-1 justify-center items-center px-6 bg-background">
      <View className="w-full max-w-md">
        <Text className="text-2xl font-semibold text-foreground text-center mb-6">
          Ready to Process
        </Text>

        <View className="mb-6 rounded-lg overflow-hidden border-2 border-border">
          <Image
            source={{ uri: imageUri }}
            style={{ width: imageWidth, height: imageHeight }}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          onPress={onProcess}
          disabled={isProcessing}
          className={`py-4 px-6 rounded-lg mb-3 ${
            isProcessing ? 'bg-muted opacity-50' : 'bg-primary active:opacity-80'
          }`}
        >
          <Text className="text-primary-foreground text-center text-base font-medium">
            {isProcessing ? 'Processing...' : '🚀 Process Image'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onChangeImage}
          disabled={isProcessing}
          className={`py-4 px-6 rounded-lg border border-border ${
            isProcessing ? 'opacity-50' : 'active:opacity-80'
          }`}
        >
          <Text className="text-foreground text-center text-base font-medium">
            Change Image
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
