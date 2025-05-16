import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  jwt_secret: process.env.SUPABASE_JWT_SECRET,
}));
