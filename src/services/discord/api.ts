import { RequestData } from '@discordjs/rest';
import discord from 'utils/discordApiInstance';

export const postDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.post(url, options) as T;

export const getDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.get(url, options) as T;

export const putDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.put(url, options) as T;

export const deleteDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.delete(url, options) as T;

export const patchDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.patch(url, options) as T;
