import { z } from 'zod';

export const LocationQuerySchema = z.object({
	cityName: z.string(),
	stateCode: z.string(),
	countryCode: z.string(),
	limit: z.number().optional(),
})

export type LocationQuery = z.infer<typeof LocationQuerySchema>

export const LocationResponseSchema = z.object({
	name: z.string(),
	localNames: z.array(z.string()),
	lat: z.number(),
	lon: z.number(),
	state: z.string(),
	country: z.string(),
})

export type LocationResponse = z.infer<typeof LocationResponseSchema>

export const WeatherQuerySchema = z.object({
	lat: z.number(),
	lon: z.number(),
	exclude: z.array(z.enum(['minutely', 'hourly', 'daily', 'alerts'])).optional(),
	lang: z.enum(['en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh']).optional(),
})

export type WeatherQuery = z.infer<typeof WeatherQuerySchema>

const WeatherPeriodSchema = z.object({
	dt: z.number(),
	sunrise: z.number(),
	sunset: z.number(),
	temp: z.number(),
	pressure: z.number(),
	humidity: z.number(),
	weather: z.array(z.object({
		id: z.number(),
		main: z.string(),
		description: z.string(),
		icon: z.string(),
	})),
	clouds: z.number(),
	wind_speed: z.number(),
	wind_deg: z.number(),
})

export const WeatherResponseSchema = z.object({
	lat: z.number(),
	lon: z.number(),
	timezone: z.string(),
	timezone_offset: z.number(),
	current: WeatherPeriodSchema,
	daily: WeatherPeriodSchema.array(),
	hourly: WeatherPeriodSchema.array(),
})

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>

export interface WeatherAtLocation {
	latitude: number;
	longitude: number;
	generationtime_ms: number;
	timezone: string;
	current_units: {
		time: string;
		interval: string;
		temperature: string;
	};
	current: {
		time: string;
		interval: number;
		temperature: number;
	};
	hourly_units: {
		time: string;
		temperature: string;
	};
	hourly: {
		time: string[];
		temperature: number[];
	};
	daily_units: {
		time: string;
		sunrise: string;
		sunset: string;
	};
	daily: {
		time: string[];
		sunrise: string[];
		sunset: string[];
	};
}