/* AUTO CREATE TABLE INTERFACE :: 1738571722479 */
export const TABLES = [ 'Achievements', 'Achievements_type', 'advertisement', 'advertisement_cnt', 'ai_message_log', 'attendance', 'attendance_rank', 'auth', 'auth_bord', 'auth_conntection', 'auth_jwt', 'auth_option', 'auth_option_type', 'auth_order', 'auth_otp', 'auth_payment', 'auth_payment_type', 'auth_point', 'auth_point_guild', 'auth_point_log', 'auth_point_shop', 'auth_point_shop_order', 'auth_report', 'auth_rule', 'auth_rule_type', 'auth_token', 'auth_type', 'channel', 'chat_alias', 'chat_cmd', 'chat_cmd_log', 'chat_cmd_type', 'chat_link', 'chat_log', 'chat_permission', 'chat_permission_type', 'chat_state', 'chat_user_connect', 'chat_user_history', 'code', 'commant', 'component', 'component_action_row', 'component_action_row_connect', 'component_col', 'component_group', 'component_low', 'component_option', 'component_option_connection', 'component_style', 'component_type', 'embed', 'embed_template', 'embed_twitch_notice', 'embed_user', 'enquiry', 'enquiry_message', 'env', 'error_logs', 'error_sql', 'event_channel', 'event_clip', 'event_id', 'event_id_register', 'event_live', 'event_log', 'event_online', 'event_online_mpd', 'event_video', 'file', 'file_cdn', 'file_cdn_type', 'guild', 'guild_invite', 'image', 'link_target', 'link_target_history', 'mansion', 'message', 'message_conntection', 'message_content_type', 'message_log', 'message_post', 'message_post_connect', 'message_user', 'notice', 'notice_channel', 'notice_detail', 'notice_guild', 'notice_history', 'notice_history_detail', 'notice_hook', 'notice_live', 'notice_type', 'notice_video', 'payment_order', 'payment_order_state', 'payment_order_type', 'payment_subscribe', 'permissions', 'play_book', 'play_page', 'post', 'post_like', 'post_type', 'qna', 'qna_question', 'qna_type', 'question', 'send_message', 'state', 'table_log', 'task', 'task2', 'text_message', 'types', 'upload_file', 'video', 'voice_ticket', 'webhooks' ];
export const TABLES_COUNT = 120;
/* 업적 */
export * from './discord/Achievements';
/* 업적 타입 */
export * from './discord/Achievements_type';
/* 광고 관리
임베드 형식을 지향
https://discord.com/developers/docs/resources/channel#embed-object */
export * from './discord/advertisement';
/* 광고 카운팅 테이블 */
export * from './discord/advertisement_cnt';
/*  */
export * from './discord/ai_message_log';
/* ALTER TABLE attendance ADD PARTITION (
	PARTITION p2410 VALUES LESS THAN (2410),
	PARTITION p2411 VALUES LESS THAN (2411),
	PARTITION p2412 VALUES LESS THAN (2412)
) */
export * from './discord/attendance';
/*  */
export * from './discord/attendance_rank';
/* Discord user data */
export * from './discord/auth';
/* 인증 보드
(기존에 이벤트 테이블의 인증 관련 그룹만 땡겨옴) */
export * from './discord/auth_bord';
/* AUTH 테이블과 AUTH_TOKEN테이블을 연결함
-> 파티셔닝 이슈로 중복값 탐색이 불가능
-> 함수를 통해 AUTH_TOKEN에 넣기전, 선행으로 해당 테이블을 통해 값의 무결성 여부를 확인해야 함. */
export * from './discord/auth_conntection';
/* jwt 토큰 관리자
생성시간 + 난수(10) + 사용자 id


추후 사용하지 않음 - JWT로 변경 */
export * from './discord/auth_jwt';
/* 사용자 개별 옵션 */
export * from './discord/auth_option';
/* 사용자 개별 옵션 */
export * from './discord/auth_option_type';
/* 사용자 결제 이력 */
export * from './discord/auth_order';
/* 직접 결제 요청시, 중간에 OTP로 결제 인증(암호 안씀) */
export * from './discord/auth_otp';
/* 결제 */
export * from './discord/auth_payment';
/* 결제 타겟 타입 */
export * from './discord/auth_payment_type';
/* point 관리 테이블 */
export * from './discord/auth_point';
/* point 길드 옵션 */
export * from './discord/auth_point_guild';
/* point 로그 관리 테이블 */
export * from './discord/auth_point_log';
/* point 관리 테이블 */
export * from './discord/auth_point_shop';
/* point 구매이력 */
export * from './discord/auth_point_shop_order';
/* 신고 */
export * from './discord/auth_report';
/* 인증 - 사용자 인증을 한 경우 */
export * from './discord/auth_rule';
/* 역할 타입
- 사용하지 않음 */
export * from './discord/auth_rule_type';
/* 인증기관


ALTER TABLE auth_token ADD PARTITION (
	PARTITION ``twitch.affiliate`` VALUES LESS THAN (36),
	PARTITION ``twitch.partner`` VALUES LESS THAN (37)
) */
export * from './discord/auth_token';
/* Discord user type */
export * from './discord/auth_type';
/* 디스코드 - 채널 */
export * from './discord/channel';
/* 채팅 별칭 */
export * from './discord/chat_alias';
/* 채팅 명령어 */
export * from './discord/chat_cmd';
/* 채팅 명령 이력 */
export * from './discord/chat_cmd_log';
/* 인증기관 */
export * from './discord/chat_cmd_type';
/* 채팅 링크 */
export * from './discord/chat_link';
/* 채팅 이력 */
export * from './discord/chat_log';
/* 채팅 권한 */
export * from './discord/chat_permission';
/* 채팅 권한 */
export * from './discord/chat_permission_type';
/*  */
export * from './discord/chat_state';
/* 방문기록 */
export * from './discord/chat_user_connect';
/* 이력 */
export * from './discord/chat_user_history';
/*  */
export * from './discord/code';
/*  */
export * from './discord/commant';
/*  */
export * from './discord/component';
/* 컴포넌트 ACTION_ROW */
export * from './discord/component_action_row';
/* 컴포넌트 ACTION_ROW */
export * from './discord/component_action_row_connect';
/* 그룹과 컴포넌트를 중재
col */
export * from './discord/component_col';
/*  */
export * from './discord/component_group';
/* 그룹과 컴포넌트를 중재 */
export * from './discord/component_low';
/* 컴포넌트 하위 옵션값 */
export * from './discord/component_option';
/* 옵션 - 컴포넌트 관계 */
export * from './discord/component_option_connection';
/* 컴포넌트 스타일 */
export * from './discord/component_style';
/* 컴포넌트 코드 관리 */
export * from './discord/component_type';
/* 임베드 구조체 */
export * from './discord/embed';
/* 임베드 전송 템플릿 - 커스터마이징용 */
export * from './discord/embed_template';
/* 임베드 구조체 */
export * from './discord/embed_twitch_notice';
/* 임베드 구조체 - 사용자용 */
export * from './discord/embed_user';
/* 문의사항 - 1-1 채팅 */
export * from './discord/enquiry';
/*  */
export * from './discord/enquiry_message';
/* 환경변수 */
export * from './discord/env';
/* error_logs */
export * from './discord/error_logs';
/* 쿼리 오류 기록 테이블 */
export * from './discord/error_sql';
/* 이벤트 전송 채널 */
export * from './discord/event_channel';
/* 클립 관리자 */
export * from './discord/event_clip';
/* 이벤트 관리자
idx in (14,15,16,17,18,19,20,23,52) */
export * from './discord/event_id';
/* 이벤트 오류 */
export * from './discord/event_id_register';
/* 라이브 진행중인... */
export * from './discord/event_live';
/* 파티셔닝 로그
- 파티션 추가
ALTER TABLE event_log ADD PARTITION (PARTITION p6 VALUES LESS THAN (2026)) */
export * from './discord/event_log';
/* 온라인 이벤트 */
export * from './discord/event_online';
/* 라이브 스트리밍 정보 */
export * from './discord/event_online_mpd';
/*  */
export * from './discord/event_video';
/* 파일업로드 DB */
export * from './discord/file';
/* 파일업로드 DB */
export * from './discord/file_cdn';
/* 파일업로드 DB */
export * from './discord/file_cdn_type';
/* 길드정보 */
export * from './discord/guild';
/* 길드 초대 이력 */
export * from './discord/guild_invite';
/* 이미지 저장 DB */
export * from './discord/image';
/* 링크 카운터 테이블 (히스토리) */
export * from './discord/link_target';
/* 링크 카운터 테이블 (히스토리) - 이력 */
export * from './discord/link_target_history';
/* 맨션 */
export * from './discord/mansion';
/* 메세지 컴포넌트 */
export * from './discord/message';
/* 메세지 콘텐츠 */
export * from './discord/message_conntection';
/* 컴포넌트 연결 종류 */
export * from './discord/message_content_type';
/* 메세지 전송 이력 */
export * from './discord/message_log';
/* 메세지 포스트 마스터 */
export * from './discord/message_post';
/* 메세지 포스트 마스터 */
export * from './discord/message_post_connect';
/* 사용자 생성 메세지 */
export * from './discord/message_user';
/* 알림 테이블
- 알림을 모니터링 합니다 */
export * from './discord/notice';
/* 알림 채널 */
export * from './discord/notice_channel';
/* 알림 - 상세 */
export * from './discord/notice_detail';
/*  */
export * from './discord/notice_guild';
/* 라이브 상태변경 이력 */
export * from './discord/notice_history';
/* 라이브 상태변경 이력 - 상세 */
export * from './discord/notice_history_detail';
/* 알림 훅 */
export * from './discord/notice_hook';
/* 알림 이력
 - 중복 알림 필터링을 위한 테이블 */
export * from './discord/notice_live';
/* 알림 타입 */
export * from './discord/notice_type';
/*  */
export * from './discord/notice_video';
/* 구매이력
- 1000원이하는 결제하지 않음 */
export * from './discord/payment_order';
/* 결제 상태 */
export * from './discord/payment_order_state';
/* 주문 아이템 */
export * from './discord/payment_order_type';
/* 구독 결제 */
export * from './discord/payment_subscribe';
/* discord permissions */
export * from './discord/permissions';
/* 음악책 -> 재생책 */
export * from './discord/play_book';
/* 음악책 -> 재생책 */
export * from './discord/play_page';
/*  */
export * from './discord/post';
/* 포스트 상태 */
export * from './discord/post_like';
/*  */
export * from './discord/post_type';
/* 질의 응답 */
export * from './discord/qna';
/* 질문 메세지 */
export * from './discord/qna_question';
/* 질의응답 타입 */
export * from './discord/qna_type';
/*  */
export * from './discord/question';
/* 메세지 전송 이력 */
export * from './discord/send_message';
/* 상태 테이블 */
export * from './discord/state';
/* 이벤트 테이블 로그 - 인서트만 됨 */
export * from './discord/table_log';
/* ECS 테스크 정보 */
export * from './discord/task';
/* 물리적으로 분리된 서버 */
export * from './discord/task2';
/* 전송용 메세지

lang_type = 9 */
export * from './discord/text_message';
/* 타입을 설정함
key
1 :인증관련
2 : 디스코드  컴포넌트 타입
3 : 훅 수신 이벤트
4 : 디스코드 웹훅타입
5 : 트수인증 타입
6 : 디스코드 채널 타입
7 : 인증사용자의 타입 (auth_token)
8 : 노래 종류
9 : 언어 */
export * from './discord/types';
/* 업로드 된 파일 옵션 링크 관리 */
export * from './discord/upload_file';
/* 비디오 저장 테이블 */
export * from './discord/video';
/* 음악 티켓 */
export * from './discord/voice_ticket';
/* 채널별 훅을 관리합니다 */
export * from './discord/webhooks';