import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export const ProcessingStatus: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center px-6 bg-background">
      <ActivityIndicator size="large" color="#030213" />
      <Text className="text-foreground text-lg mt-6 text-center">
        Processing image...
      </Text>
      <Text className="text-muted-foreground text-sm mt-2 text-center">
        This may take a few moments
      </Text>
    </View>
  );
};
