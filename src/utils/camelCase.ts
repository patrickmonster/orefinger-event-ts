const UPPERCASE = /[\p{Lu}]/u;
const LOWERCASE = /[\p{Ll}]/u;
const LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
const IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
const SEPARATORS = /[_.\- ]+/;

const LEADING_SEPARATORS = new RegExp('^' + SEPARATORS.source);
const SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, 'gu');
const NUMBERS_AND_IDENTIFIER = new RegExp('\\d+' + IDENTIFIER.source, 'gu');

type ToCase = (str: string) => string;

const preserveCamelCase = (
    str: string,
    toLowerCase: ToCase,
    toUpperCase: ToCase,
    preserveConsecutiveUppercase: boolean = false
) => {
    let isLastCharLower = false;
    let isLastCharUpper = false;
    let isLastLastCharUpper = false;
    let isLastLastCharPreserved = false;

    for (let index = 0; index < str.length; index++) {
        const character = str[index];
        isLastLastCharPreserved = index > 2 ? str[index - 3] === '-' : true;

        if (isLastCharLower && UPPERCASE.test(character)) {
            str = str.slice(0, index) + '-' + str.slice(index);
            isLastCharLower = false;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = true;
            index++;
        } else if (
            isLastCharUpper &&
            isLastLastCharUpper &&
            LOWERCASE.test(character) &&
            (!isLastLastCharPreserved || preserveConsecutiveUppercase)
        ) {
            str = str.slice(0, index - 1) + '-' + str.slice(index - 1);
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = false;
            isLastCharLower = true;
        } else {
            isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
            isLastLastCharUpper = isLastCharUpper;
            isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
        }
    }

    return str;
};

const preserveConsecutiveUppercase = (input: string, toLowerCase: ToCase) => {
    LEADING_CAPITAL.lastIndex = 0;

    return input.replace(LEADING_CAPITAL, match => toLowerCase(match));
};

const postProcess = (input: string, toUpperCase: ToCase) => {
    SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
    NUMBERS_AND_IDENTIFIER.lastIndex = 0;

    return input
        .replace(NUMBERS_AND_IDENTIFIER, (match, pattern, offset) =>
            ['_', '-'].includes(input.charAt(offset + match.length)) ? match : toUpperCase(match)
        )
        .replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier));
};

export default function camelCase(
    input: string,
    options: {
        locale?: Intl.LocalesArgument | false;
        pascalCase?: boolean;
        preserveConsecutiveUppercase?: boolean;
    } = {
        locale: false,
        pascalCase: false,
        preserveConsecutiveUppercase: false,
    }
) {
    if (!(typeof input === 'string' || Array.isArray(input))) {
        throw new TypeError('Expected the input to be `string | string[]`');
    }

    if (Array.isArray(input)) {
        input = input
            .map(x => x.trim())
            .filter(x => x.length)
            .join('-');
    } else {
        input = input.trim();
    }

    if (input.length === 0) {
        return '';
    }

    const toLowerCase = (str: string) => (options.locale ? str.toLocaleLowerCase(options.locale) : str.toLowerCase());
    const toUpperCase = (str: string) => (options.locale ? str.toLocaleUpperCase(options.locale) : str.toUpperCase());

    if (input.length === 1) {
        if (SEPARATORS.test(input)) {
            return '';
        }

        return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
    }

    const hasUpperCase = input !== toLowerCase(input);

    if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase, options.preserveConsecutiveUppercase);
    }

    input = input.replace(LEADING_SEPARATORS, '');
    input = options.preserveConsecutiveUppercase
        ? preserveConsecutiveUppercase(input, toLowerCase)
        : toLowerCase(input);

    if (options.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
    }

    return postProcess(input, toUpperCase);
}
