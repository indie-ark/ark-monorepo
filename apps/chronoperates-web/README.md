# Calendar Event Extractor

A React-based web application that extracts calendar events from images and generates downloadable ICS files. Upload an image containing calendar information (screenshots, photos of calendars, etc.) and get a standard calendar file that you can import into Google Calendar, Apple Calendar, Outlook, or any other calendar application.

## Features

- **Image Upload**: Drag & drop, file browser, or paste from clipboard
- **AI-Powered Extraction**: Uses Claude AI to analyze images and extract event details
- **Calendar Generation**: Creates standard ICS files for easy import
- **Multiple Format Support**: JPEG, PNG, BMP, WebP (up to 10MB)
- **Import Instructions**: Built-in guidance for popular calendar applications

## Tech Stack

- React 19 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- react-dropzone for file uploads
- react-hot-toast for notifications

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- A backend service running on `localhost:8000` with the following endpoints:
  - `POST /upload-image` - for processing images
  - `GET /download-ics` - for downloading generated calendar files

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the project
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

### Linting

```bash
# Run ESLint to check for code issues
npm run lint
```

#### Build and Run with Docker

```bash
# Build the Docker image
docker build -t chronoperates-web .

# Run the container
docker run -p 3000:3000 chronoperates-web
```

The application will be available at `http://localhost:3000`

## Usage

1. **Upload an Image**: Drag and drop an image containing calendar events, use the file browser, or paste from clipboard (Ctrl+V)
2. **Process**: Click "Process Image" to analyze the image with AI
3. **Download**: Download the generated ICS file when processing is complete
4. **Import**: Follow the provided instructions to import the calendar file into your preferred calendar application

## Project Structure

```
src/
├── components/
│   ├── ImageUpload.tsx      # File upload interface
│   ├── ProcessingStatus.tsx # Loading state display
│   └── DownloadSection.tsx  # Results and download interface
├── App.tsx                  # Main application component
└── main.tsx                 # Application entry point
```

## API Integration

This frontend expects a backend service with the following API contract:

- `POST /upload-image`: Accepts form data with image file, returns processing results
- `GET /download-ics?file_path=...`: Returns the generated ICS file for download