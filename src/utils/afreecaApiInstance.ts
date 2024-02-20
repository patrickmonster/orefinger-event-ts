'use strict';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { error as errorLog } from './logger';

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const afreecaAPI: CustomInstance = axios.create({
    baseURL: 'https://bjapi.afreecatv.com/api/',
    headers: {
        'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
    },
});

afreecaAPI.interceptors.response.use(
    ({ data }) => {
        console.log('AFREECA API', data);
        return data;
    }, // 데이터 변환
    async error => {
        errorLog('AXIOS', error);
        throw error;
    }
);

export default afreecaAPI;
