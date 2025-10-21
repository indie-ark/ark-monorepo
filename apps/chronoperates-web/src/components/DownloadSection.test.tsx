import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DownloadSection from './DownloadSection'

// Mock the config module
vi.mock('../config', () => ({
  getApiUrl: () => 'http://localhost:8000',
}))

describe('DownloadSection', () => {
  const mockOnReset = vi.fn()
  const defaultProps = {
    icsFileUrl: '/tmp/calendar.ics',
    eventsFound: 2,
    extractedText: 'Event 1\nEvent 2',
    onReset: mockOnReset,
  }

  beforeEach(() => {
    mockOnReset.mockClear()
    vi.clearAllMocks()

    // Mock fetch
    global.fetch = vi.fn()
  })

  it('should display correct event count (singular)', () => {
    render(<DownloadSection {...defaultProps} eventsFound={1} />)
    expect(screen.getAllByText(/1 event/i)[0]).toBeInTheDocument()
  })

  it('should display correct event count (plural)', () => {
    render(<DownloadSection {...defaultProps} />)
    expect(screen.getAllByText(/2 events/i)[0]).toBeInTheDocument()
  })

  it('should show calendar filename', () => {
    render(<DownloadSection {...defaultProps} />)
    expect(screen.getByText('calendar_events.ics')).toBeInTheDocument()
  })

  it('should fetch from correct API endpoint when download button clicked', async () => {
    const mockBlob = new Blob(['ics content'], { type: 'text/calendar' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    render(<DownloadSection {...defaultProps} />)

    const downloadButton = screen.getByRole('button', { name: /download/i })
    await userEvent.click(downloadButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/download-ics?file_path=%2Ftmp%2Fcalendar.ics'
      )
    })
  })

  it('should create blob URL and trigger download on successful fetch', async () => {
    const mockBlob = new Blob(['ics content'], { type: 'text/calendar' })
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    })

    render(<DownloadSection {...defaultProps} />)

    const downloadButton = screen.getByRole('button', { name: /download/i })
    await userEvent.click(downloadButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
    })
  })

  it('should call onReset when reset button clicked', async () => {
    render(<DownloadSection {...defaultProps} />)

    const resetButton = screen.getByRole('button', { name: /process another image/i })
    await userEvent.click(resetButton)

    expect(mockOnReset).toHaveBeenCalledTimes(1)
  })

  it('should conditionally show extracted text section', () => {
    const { rerender } = render(<DownloadSection {...defaultProps} extractedText={null} />)
    expect(screen.queryByText('Extracted Details')).not.toBeInTheDocument()

    rerender(<DownloadSection {...defaultProps} extractedText="Some text" />)
    expect(screen.getByText('Extracted Details')).toBeInTheDocument()
    expect(screen.getByText('Some text')).toBeInTheDocument()
  })

  it('should display import instructions', () => {
    render(<DownloadSection {...defaultProps} />)

    expect(screen.getByText(/import to your calendar/i)).toBeInTheDocument()
    expect(screen.getByText(/Google Calendar/i)).toBeInTheDocument()
    expect(screen.getByText(/Apple Calendar/i)).toBeInTheDocument()
    expect(screen.getByText(/Outlook/i)).toBeInTheDocument()
  })
})
