import { tool } from 'ai';
import * as moment from 'moment';

import type { LocationQuery, LocationResponse, WeatherResponse, WeatherQuery } from '@/lib/types';
import { LocationQuerySchema, type WeatherAtLocation } from '@/lib/types';

const LOACATION_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';

export const getCityLocation = async (cityQuery: LocationQuery): Promise<LocationResponse[]> => {
  'use server';

  const url = `${LOACATION_API_URL}?q=${cityQuery.cityName},${cityQuery.stateCode},${cityQuery.countryCode}&appid=${process.env.OPEN_WEATHER_API_KEY}&limit=${cityQuery.limit ?? 5}`;
  //console.log(`getCityLocation: ${cityQuery.cityName},${cityQuery.stateCode},${cityQuery.countryCode}`);
  try {
    const response = await fetch(url);
    const data = await response.json() as LocationResponse[];
    return data;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate query');
  }
};

export const getCityWeather = async (cityQuery: WeatherQuery): Promise<WeatherResponse> => {
  'use server';
  const url = `${WEATHER_API_URL}?lat=${cityQuery.lat}&lon=${cityQuery.lon}&appid=${process.env.OPEN_WEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json() as WeatherResponse;
    return data;
  } catch (e) {
    console.error(e);
    throw new Error('Failed to generate query');
  }
};

function kelvinToCelsius(kelvin: number) {
  return Math.round(kelvin - 273.15);
}

function celsiusToKelvin(celsius: number) {
  return Math.round(celsius + 273.15);
}

function processWeatherData(weatherData: WeatherResponse): WeatherAtLocation {
  const hourlyData: WeatherAtLocation['hourly'] = {
    time: weatherData.hourly.map(hour => moment.unix(hour.dt).utc().format('YYYY-MM-DD HH:mm:ss')),
    temperature: weatherData.hourly.map(hour => kelvinToCelsius(hour.temp)),
  };

  const dailyData: WeatherAtLocation['daily'] = {
    time: weatherData.daily.map(day => moment.unix(day.dt).utc().format('YYYY-MM-DD HH:mm:ss')),
    sunrise: weatherData.daily.map(day => moment.unix(day.sunrise).utc().format('YYYY-MM-DD HH:mm:ss')),
    sunset: weatherData.daily.map(day => moment.unix(day.sunset).utc().format('YYYY-MM-DD HH:mm:ss')),
  };

  const weather: WeatherAtLocation = {
    latitude: weatherData.lat,
    longitude: weatherData.lon,
    generationtime_ms: weatherData.current.dt,
    timezone: weatherData.timezone,
    current_units: { time: 'iso8601', interval: 'seconds', temperature: '°C' },
    current: {
      time: moment.unix(weatherData.current.dt).utc().format('YYYY-MM-DD HH:mm:ss'),
      interval: weatherData.current.dt,
      temperature: kelvinToCelsius(weatherData.current.temp),
    },
    hourly_units: { time: 'iso8601', temperature: '°C' },
    hourly: hourlyData,
    daily_units: {
      time: 'iso8601',
      sunrise: 'iso8601',
      sunset: 'iso8601',
    },
    daily: dailyData,
  };

  return weather;
}

export const getWeatherData = async (location: LocationQuery): Promise<WeatherAtLocation> => {
  const locationData = await getCityLocation(location);

  /*** 
  const weatherData = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
  );
  ***/

  const weatherQuery: WeatherQuery = {
    lat: Math.abs(locationData[0].lat),
    lon: Math.abs(locationData[0].lon),
    lang: 'en',
    exclude: ['minutely', 'alerts'],
  };

  const weatherData: WeatherResponse = await getCityWeather(weatherQuery);
  //console.log(`getCityWeather Response:\n ${JSON.stringify(Object.keys(weatherData), null, 2)}`);
  //console.log(`getCityWeather Response:\n ${JSON.stringify(weatherData.hourly[0], null, 2)}`);
  //console.log(`getCityWeather Response:\n ${weatherData.hourly.length}`);
  return processWeatherData(weatherData);
}

export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: LocationQuerySchema,
  execute:getWeatherData,
});