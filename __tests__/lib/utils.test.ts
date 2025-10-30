import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('px-2 py-1', 'px-3')
    expect(result).toBe('py-1 px-3')
  })

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', 'visible')
    expect(result).toBe('base-class visible')
  })

  it('should handle undefined and null', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })
})
