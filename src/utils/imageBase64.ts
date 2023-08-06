import axios from 'axios';

export default async (url: string) =>
    axios
        .get(url, {
            responseType: 'arraybuffer',
        })
        .then(image => Buffer.from(image.data).toString('base64'));
