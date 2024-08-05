import { addPoint } from 'controllers/point';

/**
 * 포인트 지급 (확장을 위해 분리)
 * @param user_id
 * @param point
 * @param reason
 */
export const addPointUser = async (user_id: string, point: number, reason: string) => {
    addPoint(user_id || '', 1000, reason).catch(console.error);
};
