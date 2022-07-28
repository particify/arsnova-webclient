// A randomly generated number is used to avoid collisions with the text.
export const PATTERN_PLACEHOLDER = '__PLACEHOLDER64814__';

export class FormattingOption {
  name: string;
  icon: string;
  openingTag: string;
  closingTag?: string;
  placeholder: string;
  pattern: RegExp;

  constructor(name: string, icon: string, openingTag: string, closingTag?: string, placeholder?: string) {
    this.name = name;
    this.icon = icon;
    this.openingTag = openingTag;
    this.closingTag = closingTag;
    this.placeholder = placeholder;
    this.pattern = closingTag
        ? new RegExp(`${this.escapeTag(openingTag)}${PATTERN_PLACEHOLDER}${this.escapeTag(closingTag)}`)
        : new RegExp(`^${this.escapeTag(openingTag)}`);
  }

  hasClosingTag() {
    return !!this.closingTag;
  }

  getPattern() {
    return this.pattern;
  }

  private escapeTag(tag: string) {
    return tag.replace(/([.*$()[\]])/g, '\\$1');
  }
}
