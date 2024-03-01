import { config } from 'dotenv';
import { join } from 'path';
import { env } from 'process';

config({
    path: join(env.PWD || __dirname, `/src/env/.env.local`),
});

import 'bat/afreeca';
