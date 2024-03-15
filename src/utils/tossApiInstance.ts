'use strict';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, confssig?: AxiosRequestConfig): Promise<T>;
}

const toss: CustomInstance = axios.create({
    baseURL: 'https://api.tosspayments.com/v1/', // discordTk
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(process.env.TOSS_SECRET + ':')}`,
    },
});

toss.interceptors.request.use(
    config => {
        console.log('================= AXIOS REQUEST ==================');
        console.log(config);
        console.log('==================================================');
        return config;
    },
    error => {
        console.error(error.response.data);
        return Promise.reject(error);
    }
);

toss.interceptors.response.use(
    ({ data }) => data, // 데이터 변환
    error => {
        console.error(error.response);
        return Promise.reject(error);
    }
);

export default toss;
