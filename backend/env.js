import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(5555),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const env = envSchema.parse(process.env);

export default env;
