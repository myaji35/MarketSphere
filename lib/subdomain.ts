/**
 * 한글 상점명을 영문 서브도메인으로 변환
 */
export function generateSubdomain(storeName: string): string {
  // 1. 한글 자모 분해 및 로마자 변환 (간단한 매핑)
  const korToEng: { [key: string]: string } = {
    // 일반적인 상점명 단어
    김밥: 'kimbap',
    천국: 'chunguk',
    떡볶이: 'tteokbokki',
    순대: 'sundae',
    국밥: 'gukbap',
    분식: 'bunsik',
    반찬: 'banchan',
    정육점: 'butcher',
    청과: 'fruits',
    수산: 'seafood',
    카페: 'cafe',
    커피: 'coffee',
    베이커리: 'bakery',
    빵: 'bread',
    슈퍼: 'super',
    마트: 'mart',
    할매: 'grandma',
    할머니: 'grandma',
    옛날: 'oldschool',
    전통: 'traditional',
    우리: 'woori',
    서울: 'seoul',
    망원: 'mangwon',
    광장: 'gwangjang',
    남대문: 'namdaemun',
    동대문: 'dongdaemun',
  }

  let result = storeName.trim()

  // 2. 매핑된 단어 변환
  Object.keys(korToEng).forEach((kor) => {
    result = result.replace(new RegExp(kor, 'g'), korToEng[kor])
  })

  // 3. 남은 한글이 있으면 로마자 변환 (기본 변환)
  result = romanizeKorean(result)

  // 4. 영문 소문자로 변환
  result = result.toLowerCase()

  // 5. 공백을 하이픈으로 변환
  result = result.replace(/\s+/g, '-')

  // 6. 특수문자 제거 (영문, 숫자, 하이픈만 허용)
  result = result.replace(/[^a-z0-9-]/g, '')

  // 7. 연속된 하이픈 제거
  result = result.replace(/-+/g, '-')

  // 8. 앞뒤 하이픈 제거
  result = result.replace(/^-|-$/g, '')

  // 9. 빈 문자열이면 기본값
  if (!result) {
    result = 'store'
  }

  // 10. 최대 길이 제한 (50자)
  if (result.length > 50) {
    result = result.substring(0, 50)
  }

  return result
}

/**
 * 간단한 한글 로마자 변환 (기본 자음/모음 매핑)
 */
function romanizeKorean(text: string): string {
  const CHO = [
    'g',
    'kk',
    'n',
    'd',
    'tt',
    'r',
    'm',
    'b',
    'pp',
    's',
    'ss',
    '',
    'j',
    'jj',
    'ch',
    'k',
    't',
    'p',
    'h',
  ]
  const JUNG = [
    'a',
    'ae',
    'ya',
    'yae',
    'eo',
    'e',
    'yeo',
    'ye',
    'o',
    'wa',
    'wae',
    'oe',
    'yo',
    'u',
    'wo',
    'we',
    'wi',
    'yu',
    'eu',
    'ui',
    'i',
  ]
  const JONG = [
    '',
    'k',
    'k',
    'k',
    'n',
    'n',
    'n',
    't',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'l',
    'm',
    'p',
    'p',
    't',
    't',
    'ng',
    't',
    't',
    'k',
    't',
    'p',
    't',
  ]

  let result = ''
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)

    // 한글 음절 범위: 0xAC00 ~ 0xD7A3
    if (code >= 0xac00 && code <= 0xd7a3) {
      const syllable = code - 0xac00

      const cho = Math.floor(syllable / 588)
      const jung = Math.floor((syllable % 588) / 28)
      const jong = syllable % 28

      result += CHO[cho] + JUNG[jung] + JONG[jong]
    } else {
      result += text[i]
    }
  }

  return result
}

/**
 * 서브도메인 중복 체크 및 번호 부여
 */
export function ensureUniqueSubdomain(baseSubdomain: string, existingSubdomains: string[]): string {
  let subdomain = baseSubdomain
  let counter = 2

  while (existingSubdomains.includes(subdomain)) {
    subdomain = `${baseSubdomain}${counter}`
    counter++
  }

  return subdomain
}

/**
 * 전체 도메인 생성
 */
export function getFullDomain(subdomain: string, marketSubdomain: string): string {
  return `${subdomain}.${marketSubdomain}.marketsphere.com`
}
