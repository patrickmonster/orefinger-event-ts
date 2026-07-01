import { format } from 'date-fns';
/// 캘린더 생성

const number = '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'.split('');
const day = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default (time: Date, ...list: Date[]) => {
    const buffer = [`[0;31m឵ ${day.join('   ')}[0m឵ `];
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

    for (let i = -time.getDay() + 1; i <= lastDay; i += 7) {
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

const getSpace = (i: number) => Array.from({ length: i }, () => ' ').join('');

/**
 * 기준일을 끝주로 5주간의 캘린더를 생성합니다.
 * @param time
 * @param list
 * @returns
 */
export const sixWeek = (time: Date, ...list: Date[]) => {
    const buffer = [`${time.toLocaleDateString('en-US', { month: 'long' })}`, `[0;31m${day.join(getSpace(4))}[0m឵`];
    const dayT = (d: number) => `${d < 10 ? d + ' ' : d}`;

    // 기준일이 속한 주의 일요일에서 4주 전(= 5주 그리드의 첫 일요일)으로 이동.
    // setDate 는 월/연 경계를 자동으로 넘겨주므로 월이 바뀌어도 정렬이 어긋나지 않는다.
    time.setDate(time.getDate() - time.getDay() - 4 * 7 - 1);

    for (let weekEnd = 0; weekEnd < 5; weekEnd++) {
        buffer.push(
            Array.from({ length: 7 }, () => {
                time.setDate(time.getDate() + 1);
                const point = list.filter(item => format(item, 'yyyyMMdd') === format(time, 'yyyyMMdd'));
                return point.length
                    ? '[0;33m឵√  [0m឵'
                    : time.getDay() === 0
                    ? `[0;31m឵${dayT(time.getDate())}[0m឵ `
                    : `${dayT(time.getDate())} `;
            }).join(getSpace(2))
        );
    }

    return buffer.join('\n');
};

/**
 * 기준일을 끝주로 5주간의 캘린더를 생성합니다.
 *  -
 * @param time
 * @param list
 * @returns
 */
export const sixWeekBig = (
    {
        time,
        textLength = 10,
    }: {
        time: Date;
        textLength: number;
    },
    ...list: {
        time: Date;
        title: string;
    }[]
) => {
    const buffer = [`${time.toLocaleDateString('en-US', { month: 'long' })}`, `[0;31m${day.join(getSpace(textLength + 1))}[0m឵`];
    const dayT = (d: number): string => d + `${d < 10 ? ' ' : ''}`;

    // 기준일이 속한 주의 일요일에서 4주 전(= 5주 그리드의 첫 일요일)으로 이동.
    // setDate 는 월/연 경계를 자동으로 넘겨주므로 월이 바뀌어도 정렬이 어긋나지 않는다.
    time.setDate(time.getDate() - time.getDay() - 4 * 7 - 1);

    for (let weekEnd = 0; weekEnd < 5; weekEnd++) {
        let count = 0;
        let line = 0;
        buffer.push(
            Array.from({ length: 7 }, (_, i) => {
                time.setDate(time.getDate() + 1);
                const point = list.filter(({ time: item }) => format(item, 'yyyyMMdd') === format(time, 'yyyyMMdd'));

                count += point.length;
                line = Math.max(line, point.length);

                return point.length
                    ? '[0;33m឵√  [0m឵'
                    : time.getDay() === 0
                    ? `[0;31m឵${dayT(time.getDate())}[0m឵ `
                    : `${dayT(time.getDate())} `;
            }).join(getSpace(textLength - 1))
        );

        if (count === 0) continue;

        for (let j = 0; j < line; j++) {
            time.setDate(time.getDate() - 7);
            buffer.push(
                Array.from({ length: 7 }, (_, i) => {
                    time.setDate(time.getDate() + 1);
                    const point = list.filter(
                        ({ time: item }) => format(item, 'yyyyMMdd') === format(time, 'yyyyMMdd')
                    )[j];

                    return point
                        ? `[0;33m឵${
                              point.title.length > textLength
                                  ? point.title.slice(0, textLength) + '…'
                                  : point.title + getSpace(textLength - point.title.length + 1)
                          }[0m឵`
                        : getSpace(textLength + 1);
                }).join(getSpace(1))
            );
        }
    }

    return buffer.join('\n');
};
