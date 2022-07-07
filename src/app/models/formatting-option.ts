export class FormattingOption {
  name: string;
  icon: string;
  signs: string;
  closingTag: boolean;
  startPos: number;
  placeholder: string;

  constructor(name: string, icon: string, signs: string, closingTag = false, startPos = 0, placeholder?: string) {
    this.name = name;
    this.icon = icon;
    this.signs = signs;
    this.closingTag = closingTag;
    this.startPos = startPos;
    this.placeholder = placeholder;
  }
}