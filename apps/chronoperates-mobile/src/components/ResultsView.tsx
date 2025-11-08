import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import Toast from 'react-native-toast-message';
import { getApiUrl } from '../config';

interface ResultsViewProps {
  icsFileUrl: string;
  eventsFound: number;
  extractedText: string | null;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  icsFileUrl,
  eventsFound,
  extractedText,
  onReset,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const apiUrl = getApiUrl();
      const downloadUrl = `${apiUrl}/download-ics?file_path=${encodeURIComponent(icsFileUrl)}`;

      // Download to cache directory
      const fileUri = `${FileSystem.Paths.cache}/calendar_events.ics`;

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download ICS file');
      }

      Toast.show({
        type: 'success',
        text1: 'File downloaded',
        text2: 'Opening share menu...',
      });

      // Share the file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Save or open calendar file',
          UTI: 'public.calendar-event',
        });
      } else {
        Alert.alert('Success', 'Calendar file has been downloaded to cache.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Download failed',
        text2: 'Could not download the calendar file',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInCalendar = async () => {
    setIsOpening(true);

    try {
      const apiUrl = getApiUrl();
      const downloadUrl = `${apiUrl}/download-ics?file_path=${encodeURIComponent(icsFileUrl)}`;
      const fileUri = `${FileSystem.cacheDirectory}/calendar_events.ics`;
      const downiloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri);
      if (downloadResult.status === 200) {
        const contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          type: 'text/calendar',
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
        });
      }
    } catch (error) {
      console.error('Open failed:', error);
      Toast.show({
        type: 'info',
        text1: 'Unable to open in Calendar app',
        text2: 'Try downloading file instead',
      });
      handleDownload();
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-8">
        <Text className="text-2xl font-semibold text-foreground text-center mb-2">
          ✅ Processing Complete
        </Text>

        <View className="bg-card border border-border rounded-lg p-4 mb-6">
          <Text className="text-foreground text-center text-lg mb-1">
            {eventsFound} {eventsFound === 1 ? 'event' : 'events'} found
          </Text>
          <Text className="text-muted-foreground text-center text-sm">
            Ready to export to your calendar
          </Text>
        </View>

        <View className="space-y-3 mb-6">
          <TouchableOpacity
            onPress={handleOpenInCalendar}
            disabled={isOpening}
            className={`py-4 px-6 rounded-lg border border-border ${
              isOpening ? 'bg-primary active:opacity-50' : 'bg-primary active:opacity-80'
            }`}
          >
            <Text className="text-primary-foreground text-center text-base font-medium">
              {isOpening ? 'Opening...' : '📅 Open in Calendar App'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={isDownloading}
            className={`py-4 px-6 rounded-lg ${
              isDownloading ? 'bg-muted opacity-50' : 'active:opacity-80'
            }`}
          >
            <Text className="text-foreground text-center text-base font-medium">
              {isDownloading ? 'Downloading...' : '📥 Download Calendar File'}
            </Text>
          </TouchableOpacity>
        </View>

        {extractedText && (
          <View className="mb-6">
            <Text className="text-foreground text-lg font-medium mb-3">
              Extracted Text:
            </Text>
            <View className="bg-muted rounded-lg p-4 max-h-64">
              <ScrollView>
                <Text className="text-muted-foreground text-sm">{extractedText}</Text>
              </ScrollView>
            </View>
          </View>
        )}

        <View className="bg-accent/50 rounded-lg p-4 mb-6">
          <Text className="text-accent-foreground text-sm font-medium mb-2">
            💡 How to Import:
          </Text>
          <Text className="text-accent-foreground text-sm mb-1">
            • Google Calendar: Tap "Download" and open the .ics file
          </Text>
        </View>

        <TouchableOpacity
          onPress={onReset}
          className="py-4 px-6 rounded-lg border border-border active:opacity-80">
          <Text className="text-foreground text-center text-base font-medium">
            Process Another Image
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
