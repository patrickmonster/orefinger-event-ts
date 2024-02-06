'use strict';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { error as errorLog } from './logger';

const API_VERSION = 'v1';
const baseURL = `https://openapi.naver.com/${API_VERSION}`;
const chzzkURL = `https://comm-api.game.naver.com/nng_main/${API_VERSION}`;

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// const naver: CustomInstance = axios.create({
//     baseURL,
//     headers: {
//         authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
//         'client-id': 'q6batx0epp608isickayubi39itsckt',
//     },
// });

// export default naver;

export const naverAPI: CustomInstance = axios.create({ baseURL });

naverAPI.interceptors.response.use(
    ({ data }) => {
        console.log('NAVER API', data);
        return data;
    }, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

const apis: { [version: string]: CustomInstance } = {};

export const getChzzkAPI = (version: string, target?: 'service' | 'polling') => {
    if (!apis[version]) {
        apis[version] = axios.create({ baseURL: `https://api.chzzk.naver.com/${target || 'service'}/${version}/` });
        apis[version].interceptors.response.use(
            ({ data, config }) => {
                console.log(`CHZZK API(${version}) ::`, data, config);
                return data;
            }, // 데이터 변환
            async error => {
                errorLog('AXIOS', error);
                throw error;
            }
        );
    }
    return apis[version];
};

export interface ChzzkInterface<T extends object> {
    code: number;
    message: string;
    content: T;
}
