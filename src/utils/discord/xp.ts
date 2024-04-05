/**
 * 현재 가지고 있는 경험치를 기반으로 다음 레벨까지 필요한 경험치를 계산합니다.
 * @param xp
 * @returns number
 */
export const calculateLevel = (level: number): number => {
    let need = 0;

    for (let i = 1; i <= level; i++) {
        if (level >= 300) return 0;
        if (level <= 15) need += Math.floor(i + 100 * Math.pow(2, i / 13));
        else if (level <= 30) need += Math.floor(i + 100 * Math.pow(2, i / 10));
        else if (level <= 50) need += Math.floor(i + 100 * Math.pow(2, i / 8));
        else if (level <= 100) need += Math.floor(i + 100 * Math.pow(2, i / 7));
        else need += Math.floor(i + 100 * Math.pow(2, i / 5));
    }

    return need;
};
