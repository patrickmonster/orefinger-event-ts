/*!
 * snakecase <https://github.com/jonschlinkert/snakecase>
 * Copyright (c) Jon Schlinkert
 * Released under the MIT License.
 */

const PUNCTUATION = /[^\p{L}\p{N}]+/gu;
const REGEX = /([\p{Lu}]+[\p{Ll}\p{N}]*|[\p{Ll}\p{N}]+)/gu;
const LAZY_UPPERCASE_REGEX = /([\p{Lu}]{2,}(?![\p{Ll}\p{N}])|[\p{Lu}]+[\p{Ll}\p{N}]*|[\p{Ll}\p{N}]+)/gu;
const PRESERVE_UPPERCASE_REGEX = /([\p{Lu}]{2,}|[\p{Lu}][\p{Ll}]*|[\p{Ll}\p{N}]+)/gu;

type InputType = Function | string;

const _toString = (input: InputType) => {
    if (input == null) return '';
    if (typeof input === 'function') return input.name || '';
    if (typeof input.toString !== 'function') return '';
    return input.toString().trim();
};

const splitString = (value: string, options: Options = {}) => {
    const regex = options.preserveConsecutiveUppercase
        ? PRESERVE_UPPERCASE_REGEX
        : options.lazyUppercase !== false
        ? LAZY_UPPERCASE_REGEX
        : REGEX;

    const input = _toString(value);
    const words = value ? (input.match(regex) || []).filter(Boolean) : [];
    const output = words.filter(Boolean);

    if (output.length === 0 && value.length > 0) {
        return [value.replace(PUNCTUATION, '')];
    }

    return output;
};

const transformWords = (input: InputType, options?: Options, joinChar = '', transformFn = (s: string) => s) => {
    return input ? splitString(_toString(input), options).map(transformFn).join(joinChar) : '';
};

type Options = {
    locale?: Intl.LocalesArgument;
    lazyUppercase?: boolean;
    preserveConsecutiveUppercase?: boolean;
    separator?: string;
    transform?: Function;
};

const lowercase = (input: string = '', options?: Options) => input.toLocaleLowerCase(options?.locale);
export const snakeCase = (input: InputType = '', options?: Options) =>
    lowercase(transformWords(input, options, '_'), options);
