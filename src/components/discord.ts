import axios from 'axios';

export type Attachment = {
    name: string;
    file: Blob | string;
    target?: string;
};

export const attachmentFile = async (...url: Attachment[]) => {
    const form = new FormData();
    const list = [];

    for (const { name, file, target } of url) {
        if (file) {
            form.append('files[]', typeof file === 'string' ? await axios.get(file, { responseType: 'blob' }) : file, name);
            if (target) list.push({ name, target });
        }
    }

    for (const { name, target } of list) form.append(target, name);

    return form;
};
