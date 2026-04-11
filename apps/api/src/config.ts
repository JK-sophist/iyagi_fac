import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 3000),
  providerMode: process.env.PROVIDER_MODE ?? 'mock'
};
