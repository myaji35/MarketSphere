import { describe, it, expect } from 'vitest'
import { generateSubdomain, ensureUniqueSubdomain, getFullDomain } from '@/lib/subdomain'

describe('generateSubdomain', () => {
  it('should convert Korean store names to English subdomains', () => {
    expect(generateSubdomain('김밥천국')).toBe('kimbapchunguk')
    expect(generateSubdomain('떡볶이 나라')).toBe('tteokbokki-nara')
    expect(generateSubdomain('할매 분식')).toBe('grandma-bunsik')
  })

  it('should handle mixed Korean and English', () => {
    expect(generateSubdomain('Kim밥')).toBe('kimbap')
    expect(generateSubdomain('Cafe 커피')).toBe('cafe-coffee')
  })

  it('should remove special characters', () => {
    expect(generateSubdomain('김밥@천국!')).toBe('kimbapchunguk')
    expect(generateSubdomain('분식#1')).toBe('bunsik1')
  })

  it('should handle empty strings', () => {
    expect(generateSubdomain('')).toBe('store')
    expect(generateSubdomain('   ')).toBe('store')
  })

  it('should limit length to 50 characters', () => {
    const longName = '아주긴상점이름입니다정말로긴이름아주아주긴이름'
    const result = generateSubdomain(longName)
    expect(result.length).toBeLessThanOrEqual(50)
  })

  it('should convert to lowercase', () => {
    expect(generateSubdomain('KIMBAP')).toBe('kimbap')
    expect(generateSubdomain('CaFe')).toBe('cafe')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSubdomain('김밥 천국')).toBe('kimbap-chunguk')
    expect(generateSubdomain('할매   분식')).toBe('grandma-bunsik')
  })

  it('should remove consecutive hyphens', () => {
    expect(generateSubdomain('김밥---천국')).toBe('kimbap-chunguk')
  })
})

describe('ensureUniqueSubdomain', () => {
  it('should return original subdomain if not exists', () => {
    const existing = ['kimbap1', 'tteokbokki']
    expect(ensureUniqueSubdomain('kimbapchunguk', existing)).toBe('kimbapchunguk')
  })

  it('should append number if subdomain exists', () => {
    const existing = ['kimbapchunguk']
    expect(ensureUniqueSubdomain('kimbapchunguk', existing)).toBe('kimbapchunguk2')
  })

  it('should increment number until unique', () => {
    const existing = ['kimbapchunguk', 'kimbapchunguk2', 'kimbapchunguk3']
    expect(ensureUniqueSubdomain('kimbapchunguk', existing)).toBe('kimbapchunguk4')
  })
})

describe('getFullDomain', () => {
  it('should generate full domain correctly', () => {
    expect(getFullDomain('kimbapchunguk', 'mangwon')).toBe('kimbapchunguk.mangwon.marketsphere.com')
    expect(getFullDomain('tteokbokki', 'gwangjang')).toBe('tteokbokki.gwangjang.marketsphere.com')
  })
})
