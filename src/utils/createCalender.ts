import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
/// 캘린더 생성
export default (time: Date, ...list: Date[]) => {
    const buffer = [`[0;31m឵ ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].join('   ')}[0m឵ `];
    const lastDay = new Date(time.getFullYear(), time.getMonth() + 1, 0).getDate();

    const baseTime = format(time, 'yyyyMM');
    const pins = list.filter(date => format(date, 'yyyyMM') === baseTime);
    const dayT = (d: number) => `${d < 10 ? ' ' + d : d}`;
    const tags: {
        [key: string | number]: number;
    } = {};

    time.setDate(1);

    for (const p of pins) {
        const d = p.getDate();
        tags[d] = tags[d] ? tags[d] + 1 : 1;
    }

    for (let i = -time.getDay(); i <= lastDay; i += 7) {
        const tmp: string[] = [];
        for (let j = 0; j < 7; j++) {
            const d = i + j;
            if (d > lastDay) break;
            else tmp.push(d <= 0 ? '  ' : tags[d] ? '[0;31m឵ √[0m឵' : dayT(d));
        }
        buffer.push(tmp.join('  '));
    }

    return buffer.join('\n');
};
