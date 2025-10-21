import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the config module
vi.mock('./config', () => ({
  getApiUrl: () => 'http://localhost:8000',
}))

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should render upload area initially', () => {
    render(<App />)
    expect(screen.getByText(/drop images here or click to browse/i)).toBeInTheDocument()
    expect(screen.getByText('Calendar Event Extractor')).toBeInTheDocument()
  })

  it('should show selected image info after upload', async () => {
    render(<App />)

    const file = new File(['content'], 'test-image.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('test-image.png')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /process/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument()
    })
  })

  it('should call API with correct data when process button clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ics_file_path: '/tmp/events.ics',
        events_found: 3,
        extracted_text: 'Event data',
      }),
    })

    render(<App />)

    const file = new File(['image data'], 'calendar.jpg', { type: 'image/jpeg' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)
    await waitFor(() => screen.getByRole('button', { name: /process/i }))

    const processButton = screen.getByRole('button', { name: /process/i })
    await userEvent.click(processButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/upload-image',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      )
    })
  })

  it('should show processing state during API call', async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any // Never resolves

    render(<App />)

    const file = new File(['data'], 'image.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)
    const processButton = await screen.findByRole('button', { name: /process/i })
    await userEvent.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/processing image/i)).toBeInTheDocument()
    })
  })

  it('should display download section on successful API response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ics_file_path: '/tmp/calendar.ics',
        events_found: 2,
        extracted_text: 'Meeting at 3pm',
      }),
    })

    render(<App />)

    const file = new File(['data'], 'event.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)
    const processButton = await screen.findByRole('button', { name: /process/i })
    await userEvent.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/found 2 events/i)).toBeInTheDocument()
      expect(screen.getByText('calendar_events.ics')).toBeInTheDocument()
      expect(screen.getByText('Meeting at 3pm')).toBeInTheDocument()
    })
  })

  it('should show error message on API failure', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Invalid image format' }),
    })

    render(<App />)

    const file = new File(['bad'], 'bad.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)
    const processButton = await screen.findByRole('button', { name: /process/i })
    await userEvent.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid image format/i)).toBeInTheDocument()
    })
  })

  it('should reset to initial state when reset button clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ics_file_path: '/tmp/events.ics',
        events_found: 1,
        extracted_text: 'Event',
      }),
    })

    render(<App />)

    // Upload and process
    const file = new File(['data'], 'test.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    const processButton = await screen.findByRole('button', { name: /process/i })
    await userEvent.click(processButton)

    // Wait for download section
    await waitFor(() => screen.getByText(/found 1 event/i))

    // Click reset
    const resetButton = screen.getByRole('button', { name: /process another image/i })
    await userEvent.click(resetButton)

    // Should be back to upload screen
    await waitFor(() => {
      expect(screen.getByText(/drop images here or click to browse/i)).toBeInTheDocument()
      expect(screen.queryByText(/found 1 event/i)).not.toBeInTheDocument()
    })
  })
})
