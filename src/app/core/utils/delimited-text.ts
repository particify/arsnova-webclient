export const DELIMITED_TEXT_CHARSETS = ['UTF-8', 'UTF-16LE'] as const;

export type DelimitedTextCharset = (typeof DELIMITED_TEXT_CHARSETS)[number];
