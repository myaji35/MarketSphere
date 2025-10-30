import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 한글을 영문 서브도메인으로 변환
 * @param koreanText 한글 텍스트
 * @returns 영문 서브도메인
 */
export function generateSubdomain(koreanText: string): string {
  const romanization: { [key: string]: string } = {
    ㄱ: 'g',
    ㄴ: 'n',
    ㄷ: 'd',
    ㄹ: 'r',
    ㅁ: 'm',
    ㅂ: 'b',
    ㅅ: 's',
    ㅇ: '',
    ㅈ: 'j',
    ㅊ: 'ch',
    ㅋ: 'k',
    ㅌ: 't',
    ㅍ: 'p',
    ㅎ: 'h',
    ㄲ: 'kk',
    ㄸ: 'tt',
    ㅃ: 'pp',
    ㅆ: 'ss',
    ㅉ: 'jj',
    ㅏ: 'a',
    ㅑ: 'ya',
    ㅓ: 'eo',
    ㅕ: 'yeo',
    ㅗ: 'o',
    ㅛ: 'yo',
    ㅜ: 'u',
    ㅠ: 'yu',
    ㅡ: 'eu',
    ㅣ: 'i',
    ㅐ: 'ae',
    ㅒ: 'yae',
    ㅔ: 'e',
    ㅖ: 'ye',
    ㅘ: 'wa',
    ㅙ: 'wae',
    ㅚ: 'oe',
    ㅝ: 'wo',
    ㅞ: 'we',
    ㅟ: 'wi',
    ㅢ: 'ui',
  }

  let result = ''
  for (let i = 0; i < koreanText.length; i++) {
    const char = koreanText[i]
    const code = char.charCodeAt(0)

    if (code >= 0xac00 && code <= 0xd7a3) {
      // 한글 유니코드 범위
      const index = code - 0xac00
      const cho = Math.floor(index / 588)
      const jung = Math.floor((index % 588) / 28)
      const jong = index % 28

      const choList = [
        'ㄱ',
        'ㄲ',
        'ㄴ',
        'ㄷ',
        'ㄸ',
        'ㄹ',
        'ㅁ',
        'ㅂ',
        'ㅃ',
        'ㅅ',
        'ㅆ',
        'ㅇ',
        'ㅈ',
        'ㅉ',
        'ㅊ',
        'ㅋ',
        'ㅌ',
        'ㅍ',
        'ㅎ',
      ]
      const jungList = [
        'ㅏ',
        'ㅐ',
        'ㅑ',
        'ㅒ',
        'ㅓ',
        'ㅔ',
        'ㅕ',
        'ㅖ',
        'ㅗ',
        'ㅘ',
        'ㅙ',
        'ㅚ',
        'ㅛ',
        'ㅜ',
        'ㅝ',
        'ㅞ',
        'ㅟ',
        'ㅠ',
        'ㅡ',
        'ㅢ',
        'ㅣ',
      ]

      result += romanization[choList[cho]] || choList[cho]
      result += romanization[jungList[jung]] || jungList[jung]
      if (jong > 0) {
        const jongList = [
          '',
          'ㄱ',
          'ㄲ',
          'ㄳ',
          'ㄴ',
          'ㄵ',
          'ㄶ',
          'ㄷ',
          'ㄹ',
          'ㄺ',
          'ㄻ',
          'ㄼ',
          'ㄽ',
          'ㄾ',
          'ㄿ',
          'ㅀ',
          'ㅁ',
          'ㅂ',
          'ㅄ',
          'ㅅ',
          'ㅆ',
          'ㅇ',
          'ㅈ',
          'ㅊ',
          'ㅋ',
          'ㅌ',
          'ㅍ',
          'ㅎ',
        ]
        result += romanization[jongList[jong]] || jongList[jong]
      }
    } else {
      result += char
    }
  }

  // 알파벳, 숫자, 하이픈만 남기고 제거
  result = result.toLowerCase().replace(/[^a-z0-9-]/g, '')

  // 최대 50자로 제한
  return result.substring(0, 50)
}

/**
 * Full domain 생성
 * @param subdomain 상점 서브도메인
 * @param marketPrefix 시장 서브도메인 prefix
 * @returns Full domain (예: kimbap.mangwon.marketsphere.com)
 */
export function getFullDomain(subdomain: string, marketPrefix: string): string {
  return `${subdomain}.${marketPrefix}.marketsphere.com`
}
