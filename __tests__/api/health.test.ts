import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('should return status ok', async () => {
    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.status).toBe('ok')
    expect(json.timestamp).toBeDefined()
    expect(json.uptime).toBeDefined()
    expect(json.environment).toBeDefined()
  })

  it('should return valid timestamp', async () => {
    const response = await GET()
    const json = await response.json()

    const timestamp = new Date(json.timestamp)
    expect(timestamp.toString()).not.toBe('Invalid Date')
  })

  it('should return environment variable', async () => {
    const response = await GET()
    const json = await response.json()

    expect(['development', 'production', 'test']).toContain(json.environment)
  })
})
