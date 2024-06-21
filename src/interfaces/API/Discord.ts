import {
    APIGuildCategoryChannel,
    APIGuildForumChannel,
    APIGuildMediaChannel,
    APIGuildStageVoiceChannel,
    APIGuildVoiceChannel,
    APINewsChannel,
    APITextChannel,
    APIThreadChannel,
} from 'discord-api-types/v10';

export type APIGuildChannel =
    | APIGuildCategoryChannel
    | APIGuildForumChannel
    | APIGuildMediaChannel
    | APIGuildStageVoiceChannel
    | APIGuildVoiceChannel
    | APINewsChannel
    | APITextChannel
    | APIThreadChannel;

// 길드 가이드 작성을 위한 채널 정보
export type APIGuildChannelWithChildren = APIGuildChannel | (APIGuildCategoryChannel & { children: APIGuildChannel[] });
