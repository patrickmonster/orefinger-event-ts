import tmi from 'tmi.js';

const client = new tmi.Client({
    identity: {
        username: process.env.TWITCH_CLIENT,
        password: process.env.TWITCH_TOKEN,
    },
});

if (process.env.MASTER_KEY) {
    client
        .connect()
        .then(() => {
            console.log('IRC] Twitch connected');
        })
        .catch(console.error);
}

export default client;
