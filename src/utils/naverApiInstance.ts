'use strict';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_VERSION = 'v1';
const baseURL = `https://openapi.naver.com/${API_VERSION}`;

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const naver: CustomInstance = axios.create({
    baseURL,
    headers: {
        authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
        'client-id': 'q6batx0epp608isickayubi39itsckt',
    },
});

export default naver;

export const naverAPI: CustomInstance = axios.create({ baseURL });

naverAPI.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    async (error: any) => {
        console.error('Twitch API Error', error.response?.data || error.message);
        throw error;
    }
);
