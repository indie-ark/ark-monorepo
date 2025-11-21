# Chronoperates Mobile

React Native + Expo mobile application for extracting calendar events from images using AI.

## Features

- **Camera Capture** - Take photos directly with your device camera
- **Gallery Selection** - Choose existing images from your photo library
- **Share Target** - Receive images shared from other apps (Android)
- **AI Processing** - Extract calendar events using Claude AI
- **Calendar Integration** - Download ICS files or open directly in calendar apps
- **Dark Mode** - Automatic theme based on system preference
- **Tailwind Styling** - NativeWind for consistent design with web app

## Prerequisites

- Node.js 18+
- npm or yarn
- **For Android:**
  - Android Studio
  - Android SDK (API 35+)
  - Android Emulator or physical device
- **For iOS (macOS only):**
  - Xcode 15+
  - iOS Simulator or physical device

**Note:** Expo CLI is no longer required - Expo now uses `npx` commands directly.

## Installation

```bash
# Install dependencies
npm install

# Generate native code (required for share intent support)
npx expo prebuild --clean

# Start Expo development server
npm run dev

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

**Note:** This app uses native modules (`expo-share-intent`) and requires prebuild. You cannot use Expo Go - you must use a dev client or build the native app.

## Configuration

### API URL Setup

The app needs to connect to the Chronoperates API backend. Configure the API URL:

**Option 1: Environment Variable (Recommended)**

Create a `.env` file:
```bash
EXPO_PUBLIC_API_URL=http://your-api-url:8000
```

**Option 2: Update config.ts**

Edit `src/config.ts` and change the fallback URL:
```typescript
config = { apiUrl: 'http://your-ip-address:8000' };
```


## Project Structure

```
src/
├── config.ts                  # API URL configuration
├── types/
│   └── index.ts              # TypeScript interfaces
├── components/
│   ├── ImageInputOptions.tsx # Camera/gallery/share buttons
│   ├── ImagePreview.tsx      # Display selected image + process button
│   ├── ProcessingStatus.tsx  # Loading spinner
│   └── ResultsView.tsx       # Results display with download options
App.tsx                        # Main app component with state management
global.css                     # Tailwind design tokens (NativeWind)
```

## Available Scripts

```bash
# Development
npm run dev              # Start Expo dev server
npm run android          # Run on Android
npm run ios              # Run on iOS
npm start                # Alias for dev

# Building
npm run build            # TypeScript type check (for CI)

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Linting
npm run lint             # Run ESLint
```

## Android Share Target

The app is configured to receive image shares from other apps on Android:

1. Open any app with an image (Gallery, Chrome, etc.)
2. Tap the Share button
3. Select "Chronoperates"
4. The image will be loaded into the app for processing

This uses the `expo-share-intent` package configured in `app.json` plugins.

## Building for Production

### Android APK/AAB

**Using EAS Build (Recommended):**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android
```

**Local Build:**

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build with Android Studio or gradle
cd android
./gradlew assembleRelease
```

### iOS (macOS only)

```bash
# Using EAS
eas build --platform ios

# Local build
npx expo prebuild --platform ios
# Open ios/*.xcworkspace in Xcode and build
```

## Troubleshooting

### Cannot connect to API

- Ensure the API is running: `cd apps/chronoperates-api && PYTHONPATH=. uv run python src/main.py`
- Check the API URL configuration matches your network setup
- On Android emulator, use `10.0.2.2` instead of `localhost`
- On physical devices, ensure both device and computer are on the same network
- Check firewall settings allow connections on port 8000

### Camera/Gallery permissions denied

- Go to device Settings → Apps → Chronoperates → Permissions
- Enable Camera and Photos permissions
- Restart the app

### Share target not appearing (Android)

- Ensure you've run `npx expo prebuild --clean` to generate native Android config
- Rebuild the app after modifying `app.json` plugins or intent filters
- The app must be fully installed (not just via Expo Go)
- On some devices, you may need to restart after installation

### Metro bundler errors

```bash
# Clear cache and restart
npx expo start --clear
```

### TypeScript errors

```bash
# Rebuild type definitions
npm run build
```

## Development Notes

- **State Management:** Uses centralized `useState` in `App.tsx` (same pattern as web app)
- **Styling:** NativeWind (Tailwind CSS for React Native) with shared design tokens from web app
- **API Integration:** Same endpoints as web (`POST /upload-image`, `GET /download-ics`)
- **Type Safety:** TypeScript strict mode enabled, shared types in `src/types`
- **Testing:** Jest + React Native Testing Library (setup pending)

## Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Managed workflow for easier development
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **expo-image-picker** - Camera and gallery access
- **expo-file-system** - File operations
- **expo-sharing** - Native share functionality
- **expo-share-intent** - Receive shared images from other apps
- **react-native-toast-message** - Toast notifications

## License

Part of the indie-ark monorepo. See root LICENSE file.
