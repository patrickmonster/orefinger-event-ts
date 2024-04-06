// import { config } from 'dotenv';
// import { join } from 'path';
// import { env } from 'process';
// config({
//     path: join(env.PWD || __dirname, `/src/env/.env.local`),
// });

import { calculateLevel } from 'utils/discord/xp';

// import 'bat/youtube';

Array.from({ length: 300 }, (_, i) => {
    console.log(i + 1, ' :: ', calculateLevel(i));
});
