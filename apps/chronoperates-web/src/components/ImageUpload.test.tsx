import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from './ImageUpload'

describe('ImageUpload', () => {
  const mockOnImageSelect = vi.fn()

  beforeEach(() => {
    mockOnImageSelect.mockClear()
  })

  it('should render upload area with correct text', () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    expect(screen.getByText(/drop images here or click to browse/i)).toBeInTheDocument()
    expect(screen.getByText(/ctrl\+v to paste/i)).toBeInTheDocument()
  })

  it('should accept valid image files', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const file = new File(['image content'], 'test.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file)
    })
  })

  it('should enforce 10MB file size limit', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    // Create a file larger than 10MB (dropzone handles this validation)
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { type: 'image/png' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, largeFile)

    // Dropzone will reject files over 10MB
    await waitFor(() => {
      expect(mockOnImageSelect).not.toHaveBeenCalled()
    })
  })

  it('should call onImageSelect with correct file', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledTimes(1)
      expect(mockOnImageSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: 'image.jpg',
        type: 'image/jpeg',
      }))
    })
  })

  it('should handle clipboard paste events', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)

    const file = new File(['pasted'], 'paste.png', { type: 'image/png' })
    const clipboardData = {
      items: [{
        type: 'image/png',
        getAsFile: () => file,
      }],
    }

    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: clipboardData as any,
    })

    fireEvent(document, pasteEvent)

    await waitFor(() => {
      expect(mockOnImageSelect).toHaveBeenCalledWith(file)
    })
  })

  it('should accept multiple image formats', async () => {
    render(<ImageUpload onImageSelect={mockOnImageSelect} />)
    const input = screen.getByRole('presentation').querySelector('input[type="file"]') as HTMLInputElement

    const formats = [
      { name: 'test.png', type: 'image/png' },
      { name: 'test.jpg', type: 'image/jpeg' },
      { name: 'test.webp', type: 'image/webp' },
    ]

    for (const format of formats) {
      mockOnImageSelect.mockClear()
      const file = new File(['content'], format.name, { type: format.type })
      await userEvent.upload(input, file)

      await waitFor(() => {
        expect(mockOnImageSelect).toHaveBeenCalledWith(expect.objectContaining({
          type: format.type,
        }))
      })
    }
  })
})
