import { NextRequest, NextResponse } from 'next/server'
import { getWeatherByCoordinates, getWeatherByCity } from '@/lib/weather'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const city = searchParams.get('city')

    if (lat && lon) {
      const weather = await getWeatherByCoordinates(parseFloat(lat), parseFloat(lon))
      return NextResponse.json({
        success: true,
        data: weather,
      })
    } else if (city) {
      const weather = await getWeatherByCity(city)
      return NextResponse.json({
        success: true,
        data: weather,
      })
    } else {
      // 기본값: 서울
      const weather = await getWeatherByCity('Seoul')
      return NextResponse.json({
        success: true,
        data: weather,
      })
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 })
  }
}
