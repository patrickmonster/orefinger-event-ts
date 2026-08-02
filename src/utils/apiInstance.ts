import axios, { AxiosRequestConfig } from 'axios';
import { CustomInstance } from 'interfaces/API/Axios';
import { error as errorLog } from './logger';
import sleep from './sleep';

export const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

interface ApiInstanceOptions {
    /** 429 응답 시 retry_after 만큼 대기 후 재시도 */
    retry429?: boolean;
    /** 응답 데이터를 콘솔에 출력할 때 사용할 프리픽스 */
    logResponse?: string;
    /** 에러를 errorLog로 남길지 여부 (기본 true) */
    logError?: boolean;
}

/**
 * 응답 본문(data)만 반환하는 공통 axios 인스턴스를 생성합니다
 * @param config axios 설정
 * @param options 인터셉터 동작 옵션
 */
export const createApiInstance = (config: AxiosRequestConfig, options?: ApiInstanceOptions): CustomInstance => {
    const instance: CustomInstance = axios.create(config);

    instance.interceptors.response.use(
        ({ data }) => {
            if (options?.logResponse) console.log(options.logResponse, data);
            return data; // 데이터 변환
        },
        async error => {
            if (options?.retry429 && error.config && error.response && error.response.status === 429) {
                console.log('Too Many Requests! Retrying...', error.config.url);
                const { retry_after } = error.response.data;
                await sleep(Math.ceil(retry_after / 1000) + 1);
                return instance(error.config);
            }
            if (options?.logError !== false) errorLog('AXIOS', error);
            throw error;
        }
    );

    return instance;
};
