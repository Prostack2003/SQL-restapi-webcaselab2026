import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config({ quiet: true });

const DEFAULT_PORT = 3000;
const DEFAULT_NODE_ENV = 'development';

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const nodeEnv = process.env.NODE_ENV ?? DEFAULT_NODE_ENV;

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_GEOCODING_URL = 'https://geocoding-api.open-meteo.com';
const DEFAULT_FORECAST_URL = 'https://api.open-meteo.com';

const DEFAULT_MAX_WIND_SPEED_KMH = 20;
const DEFAULT_MAX_PRECIPITATION_MM = 0;

const DEFAULT_FORECAST_DAYS = 3;

const requestTimeoutMs = Number(
    process.env.REQUEST_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS
);
const geocodingBaseUrl =
    process.env.GEOCODING_BASE_URL ?? DEFAULT_GEOCODING_URL;
const forecastBaseUrl = process.env.FORECAST_BASE_URL ?? DEFAULT_FORECAST_URL;
const temperatureUnit = process.env.TEMPERATURE_UNIT ?? 'celsius';
const precipitationUnit = process.env.PRECIPITATION_UNIT ?? 'mm';

const maxWindSpeedKmh = Number(
    process.env.MAX_WIND_SPEED_KMH ?? DEFAULT_MAX_WIND_SPEED_KMH
);

const maxPrecipitationMm = Number(
    process.env.MAX_PRECIPITATION_MM ?? DEFAULT_MAX_PRECIPITATION_MM
);

const weatherForecastDays = Number(
    process.env.WEATHER_FORECAST_DAYS ?? DEFAULT_FORECAST_DAYS
);

const logLevel = process.env.LOG_LEVEL ?? 'info';

const jsonBodyLimit = process.env.JSON_BODY_LIMIT ?? '100kb';

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 100);

export {
    port,
    nodeEnv,
    requestTimeoutMs,
    geocodingBaseUrl,
    forecastBaseUrl,
    temperatureUnit,
    precipitationUnit,
    maxWindSpeedKmh,
    maxPrecipitationMm,
    weatherForecastDays,
    logLevel,
    jsonBodyLimit,
    corsOrigins,
    rateLimitWindowMs,
    rateLimitMax,
};
