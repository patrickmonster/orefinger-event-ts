import axios from 'axios';

export default async (url: string) =>
    axios
        .get<Blob>(url, {
            responseType: 'arraybuffer',
        })
        .then(res => {
            const blob = new Blob([res.data], {
                type: res.headers['content-type'],
            });
            return blob;
        });
