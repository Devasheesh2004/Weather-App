import axios from 'axios';
import type { WeatherData, HistoryData } from '../types/weather';

const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const ARCHIVE_API = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Fetches current and hourly weather data including air quality metrics.
 */
export const fetchWeather = async (lat: number, lon: number, date?: string): Promise<WeatherData> => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,precipitation,uv_index,wind_speed_10m,precipitation_probability,visibility',
    hourly: 'temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    ...(date && { start_date: date, end_date: date }),
  };

  const aqParams = {
    latitude: lat,
    longitude: lon,
    current: 'european_aqi,pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide',
    hourly: 'pm10,pm2_5',
    timezone: 'auto',
    ...(date && { start_date: date, end_date: date }),
  };

  try {
    const [weatherRes, aqRes] = await Promise.all([
      axios.get(FORECAST_API, { params }),
      axios.get(AIR_QUALITY_API, { params: aqParams }).catch(() => ({ data: { hourly: { pm10: [], pm2_5: [], time: [] }, current: null } })),
    ]);

    return {
      ...weatherRes.data,
      airQuality: aqRes.data,
    } as WeatherData;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching weather data:', message);
    throw new Error(message);
  }
};

export const fetchHistoricalWeather = async (lat: number, lon: number, startDate: string, endDate: string): Promise<HistoryData> => {
  const params = {
    latitude: lat,
    longitude: lon,
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,sunrise,sunset,wind_speed_10m_max,wind_direction_10m_dominant',
    timezone: 'auto',
  };

  const aqParams = {
    latitude: lat,
    longitude: lon,
    start_date: startDate,
    end_date: endDate,
    hourly: 'pm10,pm2_5',
    timezone: 'auto',
  };

  try {
    const [weatherRes, aqRes] = await Promise.all([
      axios.get(ARCHIVE_API, { params }),
      axios.get(AIR_QUALITY_API, { params: aqParams }).catch(() => ({ 
        data: { 
          hourly: { 
            time: Array.from({ length: 24 * 31 }, () => ""), 
            pm10: Array.from({ length: 24 * 31 }, () => 0), 
            pm2_5: Array.from({ length: 24 * 31 }, () => 0) 
          } 
        } 
      })),
    ]);

    return {
      history: weatherRes.data,
      aqHistory: aqRes.data,
    } as HistoryData;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching historical data:', message);
    // Suggest check for 2-day archive delay if the request fails
    throw new Error('Historical Archive has a 2-day delay. Try an earlier range.');
  }
};
