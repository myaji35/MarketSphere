/**
 * 날씨 정보를 가져오는 유틸리티
 * OpenWeatherMap API 사용 (무료 API 키 필요)
 * https://openweathermap.org/api
 */

export interface WeatherData {
  weather: string; // 날씨 상태 (맑음, 흐림, 비, 눈 등)
  temperature: number; // 기온 (섭씨)
  description: string; // 날씨 설명
  icon: string; // 날씨 아이콘 코드
}

/**
 * 좌표 기반으로 현재 날씨 정보를 가져옵니다.
 */
export async function getWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY가 설정되지 않았습니다. 더미 데이터를 반환합니다.');
    return getDummyWeather();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${apiKey}`,
      { next: { revalidate: 1800 } } // 30분 캐시
    );

    if (!response.ok) {
      throw new Error('날씨 정보를 가져올 수 없습니다');
    }

    const data = await response.json();

    return {
      weather: translateWeather(data.weather[0].main),
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getDummyWeather();
  }
}

/**
 * 도시 이름 기반으로 날씨 정보를 가져옵니다.
 */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY가 설정되지 않았습니다. 더미 데이터를 반환합니다.');
    return getDummyWeather();
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=kr&appid=${apiKey}`,
      { next: { revalidate: 1800 } }
    );

    if (!response.ok) {
      throw new Error('날씨 정보를 가져올 수 없습니다');
    }

    const data = await response.json();

    return {
      weather: translateWeather(data.weather[0].main),
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return getDummyWeather();
  }
}

/**
 * 영어 날씨 상태를 한국어로 변환
 */
function translateWeather(weather: string): string {
  const translations: Record<string, string> = {
    Clear: '맑음',
    Clouds: '흐림',
    Rain: '비',
    Drizzle: '이슬비',
    Thunderstorm: '천둥번개',
    Snow: '눈',
    Mist: '안개',
    Smoke: '연기',
    Haze: '실안개',
    Dust: '먼지',
    Fog: '안개',
    Sand: '모래바람',
    Ash: '화산재',
    Squall: '돌풍',
    Tornado: '토네이도',
  };

  return translations[weather] || weather;
}

/**
 * API 키가 없을 때 사용할 더미 날씨 데이터
 */
function getDummyWeather(): WeatherData {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();

  // 계절과 시간에 따라 적절한 더미 데이터 반환
  if (month >= 3 && month <= 5) {
    // 봄
    return {
      weather: '맑음',
      temperature: 18,
      description: '봄날씨',
      icon: '01d',
    };
  } else if (month >= 6 && month <= 8) {
    // 여름
    return {
      weather: '흐림',
      temperature: 28,
      description: '무더운 여름',
      icon: '02d',
    };
  } else if (month >= 9 && month <= 11) {
    // 가을
    return {
      weather: '맑음',
      temperature: 15,
      description: '선선한 가을',
      icon: '01d',
    };
  } else {
    // 겨울
    return {
      weather: '눈',
      temperature: -2,
      description: '추운 겨울',
      icon: '13d',
    };
  }
}

/**
 * 날씨와 상품 카테고리를 기반으로 마케팅 제안을 생성
 */
export function generateWeatherSuggestions(
  weather: string,
  temperature: number,
  category: string
): string[] {
  const suggestions: string[] = [];

  // 날씨 기반 제안
  if (weather === '비' || weather === '이슬비') {
    suggestions.push('비 오는 날 특별 할인');
    suggestions.push('전/부침개 재료 세트');
  } else if (weather === '눈') {
    suggestions.push('눈 오는 날 따뜻한 간식');
    suggestions.push('겨울 특별 이벤트');
  } else if (temperature >= 28) {
    suggestions.push('무더위 극복 세일');
    suggestions.push('시원한 상품 할인');
  } else if (temperature <= 5) {
    suggestions.push('추위 이기기 특가');
    suggestions.push('따뜻한 상품 할인');
  }

  // 카테고리 기반 제안
  if (category.includes('과일') || category.includes('채소')) {
    if (temperature >= 25) {
      suggestions.push('수박, 참외 특가');
    } else if (temperature <= 10) {
      suggestions.push('제철 과일 할인');
    }
  }

  return suggestions;
}
