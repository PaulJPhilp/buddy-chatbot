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
	local_names: z.record(z.string(), z.string()),
	lat: z.number(),
	lon: z.number(),
	state: z.string(),
	country: z.string(),
}).array()

export type LocationResponse = z.infer<typeof LocationResponseSchema>

export const WeatherQuerySchema = z.object({
	lat: z.number(),
	lon: z.number(),
	exclude: z.array(z.enum(['minutely', 'hourly', 'daily', 'alerts'])).optional(),
	lang: z.enum(['en', 'es', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh']).optional(),
})

export type WeatherQuery = z.infer<typeof WeatherQuerySchema>

export const HourlyWeatherSchema = z.object({
	"dt": z.number(),
	"temp": z.number(),
	"feels_like": z.number(),
	"pressure": z.number(),
	"humidity": z.number(),
	"dew_point": z.number(),
	"uvi": z.number(),
	"clouds": z.number(),
	"visibility": z.number(),
	"wind_speed": z.number(),
	"wind_deg": z.number(),
	"wind_gust": z.number(),
	"weather": z.array(
		z.object({
			id: z.number(),
			main: z.string(),
			description: z.string(),
			icon: z.string(),
		})
	)
})

export const CurrentWeatherSchema = z.object({
	"dt": z.number(),
	"sunrise": z.number(),
	"sunset": z.number(),
	"temp": z.number(),
	"feels_like": z.number(),
	"pressure": z.number(),
	"humidity": z.number(),
	"dew_point": z.number(),
	"uvi": z.number(),
	"clouds": z.number(),
	"visibility": z.number(),
	"wind_speed": z.number(),
	"wind_deg": z.number(),
	"wind_gust": z.number(),
	"weather": z.array(
		z.object({
			id: z.number(),
			main: z.string(),
			description: z.string(),
			icon: z.string(),
		})
	)
})

export const DailyWeatherRecordSchema = z.object({
	day: z.number(),
	min: z.number(),
	max: z.number(),
	night: z.number(),
	eve: z.number(),
	morn: z.number(),
})

export const DailyWeatherSchema = z.object({
	dt: z.number(),
	summary: z.string(),
	sunrise: z.number(),
	sunset: z.number(),
	temp: DailyWeatherRecordSchema,
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
	current: CurrentWeatherSchema,
	daily: DailyWeatherSchema.array(),
	hourly: HourlyWeatherSchema.array(),
})

export type WeatherResponse = z.infer<typeof WeatherResponseSchema>

export interface DailyWeatherRecord {
	day: number;
	min: number;
	max: number;
	night: number;
	eve: number;
	morn: number;
}

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
		temperature?: string;
		pressure?: string;
		humidity?: string;
		clouds?: string;
		wind_speed?: string;
		wind_deg?: string;
	};
	daily: {
		time: string[];
		summary: string[];
		sunrise: string[];
		sunset: string[];
		temperatures: DailyWeatherRecord[];
		pressure: number[];
		humidity: number[];
		clouds: number[];
		wind_speed: number[];
		wind_deg: number[];
	};
}