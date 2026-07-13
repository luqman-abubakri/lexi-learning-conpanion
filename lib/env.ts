import { config } from 'dotenv';
import { resolve } from 'node:path';

for (const envFile of ['.env.local', '.env']) {
  config({ path: resolve(process.cwd(), envFile) });
}
