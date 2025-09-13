export const CACHE_DURATION = {
    GUILD_EMOJIS: 60 * 30, // 30분
    GUILD: 60 * 30, // 30분
    GUILD_CHANNELS: 60 * 5, // 5분
    GUILD_INVITES: 60 * 5, // 5분
    CHANNELS: 60 * 5, // 5분
    GUILD_ROLES: 60 * 30, // 30분
    USER: 60 * 30, // 30분
} as const;

export const REGEX = {
    DISCORD_MENTION: /<[a]?:([\w|\d]+):(\d{17,19})>/im,
    EMOJI: /:(\w+)(~\d)?:/gim,
    ROLE: /@([ㄱ-ㅎ가-힣a-zA-Z0-9]+)(~\d)?/gim,
} as const;
