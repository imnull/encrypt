import { TO_BIN, BASE64_ENCODE, BASE64_DECODE, CODE2STR, UTF8_DECODE } from './utils';

export const encode = s => [
    TO_BIN, BASE64_ENCODE, CODE2STR
].reduce((a, b) => b(a), s);

export const decode = s => [
    TO_BIN, BASE64_DECODE, UTF8_DECODE, CODE2STR
].reduce((a, b) => b(a), s)
