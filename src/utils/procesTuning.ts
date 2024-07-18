import { error as errorLog } from 'utils/logger';

/**
 * 해당 프로세서가 종료되는것을 방지하기 위한 처리입니다.
 */
process.on('unhandledRejection', (err, promise) => {
    errorLog('unhandledRejection', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err, promise) => {
    errorLog('uncaughtException', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('uncaughtException', err);
});

process.on('SIGINT', function () {
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    process.exit();
});
