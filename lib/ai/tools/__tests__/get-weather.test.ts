import { describe, it, expect } from 'vitest';
import { getCityLocation, getCityWeather, getWeatherData } from '../get-weather';
import type { LocationQuery, WeatherQuery } from '@/lib/types';

describe('Weather Tools Integration Tests', () => {
  // Set longer timeout for API calls
  const TIMEOUT = 10000;

  describe('getCityLocation', () => {
    it('should fetch New York location data', async () => {
      const query: LocationQuery = {
        cityName: 'New York',
        stateCode: 'NY',
        countryCode: 'US'
      };

      const result = await getCityLocation(query);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        name: expect.any(String),
        latitude: expect.any(Number),
        longitude: expect.any(Number),
        state: expect.any(String),
        country: expect.any(String)
      });
    }, TIMEOUT);

    it('should handle non-existent city gracefully', async () => {
      const query: LocationQuery = {
        cityName: 'NonExistentCity123456',
        stateCode: 'XX',
        countryCode: 'YY'
      };

      const result = await getCityLocation(query);
      expect(result).toEqual([]);
    }, TIMEOUT);
  });

  describe('getCityWeather', () => {
    it('should fetch weather data for New York coordinates', async () => {
      const query: WeatherQuery = {
        lat: 40.7128,
        lon: -74.0060,
        lang: 'en'
      };

      const result = await getCityWeather(query);
      
      expect(result).toBeDefined();
      expect(result[0]).toMatchObject({
        lat: expect.any(Number),
        lon: expect.any(Number),
        timezone: expect.any(String),
        current: expect.objectContaining({
          temperature: expect.any(Number),
          pressure: expect.any(Number),
          humidity: expect.any(Number),
          weather: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              main: expect.any(String),
              description: expect.any(String),
              icon: expect.any(String)
            })
          ])
        })
      });
    }, TIMEOUT);
  });

  describe('getWeather tool', () => {
    it('should get weather for New York through the tool interface', async () => {
      const query: LocationQuery = {
        cityName: 'New York',
        stateCode: 'NY',
        countryCode: 'US'
      };

      const result = await getWeatherData(query);
      
      expect(result).toBeDefined();
      expect(result[0]).toMatchObject({
        lat: expect.any(Number),
        lon: expect.any(Number),
        timezone: expect.any(String),
        current: expect.objectContaining({
          temperature: expect.any(Number),
          pressure: expect.any(Number),
          humidity: expect.any(Number),
          weather: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              main: expect.any(String),
              description: expect.any(String),
              icon: expect.any(String)
            })
          ])
        })
      });
    }, TIMEOUT);
  });
});
