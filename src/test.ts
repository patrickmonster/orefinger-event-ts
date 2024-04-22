// import { config } from 'dotenv';
// import { join } from 'path';
// import { env } from 'process';
// config({
//     path: join(env.PWD || __dirname, `/src/env/.env.local`),
// });

import Chzzk from 'utils/chzzk/chat';

const client = new Chzzk({
    liveChannelId: '2086f44c7b09a17cef6786f21389db3b',
});
client.on('chat', message => {
    console.log(message);
});

client.connect();
