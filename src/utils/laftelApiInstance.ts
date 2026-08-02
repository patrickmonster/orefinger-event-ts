'use strict';
import { LaftelVod } from 'interfaces/API/Laftel';
import { USER_AGENT, createApiInstance } from './apiInstance';

const laftelAPI = createApiInstance({
    baseURL: 'https://api.laftel.net/api/',
    headers: { 'user-agent': USER_AGENT },
});

export default laftelAPI;

export const getLaftelVods = async () => await laftelAPI.get<LaftelVod[]>(`/search/v2/daily/`);
