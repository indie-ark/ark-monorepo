import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadConfig, getApiUrl, resetConfig } from './config'

describe('Config', () => {
  beforeEach(() => {
    // Reset config state between tests
    resetConfig()
    vi.clearAllMocks()
  })

  describe('loadConfig', () => {
    it('should fetch and load config from /config.json', async () => {
      const mockConfig = { apiUrl: 'http://api.example.com' }
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: async () => mockConfig,
      })

      await loadConfig()

      expect(global.fetch).toHaveBeenCalledWith('/config.json')
      expect(getApiUrl()).toBe('http://api.example.com')
    })

    it('should fall back to VITE_API_URL when config.json fails', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Not found'))
      import.meta.env.VITE_API_URL = 'http://localhost:3000'

      await loadConfig()

      expect(getApiUrl()).toBe('http://localhost:3000')
    })

    it('should fall back to default URL when both config.json and env fail', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Not found'))
      delete import.meta.env.VITE_API_URL

      Object.defineProperty(window, 'location', {
        value: { hostname: 'example.com' },
        writable: true,
      })

      await loadConfig()

      expect(getApiUrl()).toBe('http://example.com:8000')
    })
  })

  describe('getApiUrl', () => {
    it('should throw error when config not loaded', () => {
      expect(() => getApiUrl()).toThrow('Config not loaded')
    })

    it('should return loaded config value', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        json: async () => ({ apiUrl: 'http://test.com' }),
      })

      await loadConfig()
      expect(getApiUrl()).toBe('http://test.com')
    })
  })
})
