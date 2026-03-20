/*Weather-related type definitions for the application.*/

export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    uv_index: number;
    wind_speed_10m: number;
    precipitation_probability: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    visibility: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
  };
  airQuality: {
    current: {
      european_aqi: number;
      pm10: number;
      pm2_5: number;
      carbon_monoxide: number;
      carbon_dioxide: number;
      nitrogen_dioxide: number;
      sulphur_dioxide: number;
    };
    hourly: {
      time: string[];
      pm10: number[];
      pm2_5: number[];
    };
  };
}

export interface HistoryData {
  history: {
    daily: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      temperature_2m_mean: number[];
      precipitation_sum: number[];
      sunrise: string[];
      sunset: string[];
      wind_speed_10m_max: number[];
      wind_direction_10m_dominant: number[];
    };
  };
  aqHistory: {
    hourly: {
      time: string[];
      pm10: number[];
      pm2_5: number[];
    };
  };
}
