import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import 'dayjs/locale/ko';

// 'Do'(일자 서수), 'MMM'(월 이름) 토큰을 한국어로 출력하기 위한 공용 인스턴스
dayjs.extend(advancedFormat);
dayjs.locale('ko');

export default dayjs;
