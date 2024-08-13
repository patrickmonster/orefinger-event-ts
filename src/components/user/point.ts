import { addPoint } from 'controllers/point';

/**
 * 포인트 지급 (확장을 위해 분리)
 * @param user_id
 * @param point
 * @param reason
 */
export const addPointUser = async (user_id: string, point: number, reason: string) => {
    addPoint(user_id || '', point, reason).catch(console.error);
};

/**
 * 가산 포인트
 * @param point
 * @param count
 * @returns
 */
export const appendPointCount = (point: number, count: number) => {
    if (count == 5) return point;

    if (count == 10) return point + 1000;
    if (count == 20) return point + 2000;
    if (count == 50) return point + 5000;
    if (count == 100) return point + 10000;
    if (count == 500) return point + 50000;

    if (count == 1000) return point + 100000;

    return point;
};
