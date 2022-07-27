export class FormattingOption {
  name: string;
  icon: string;
  openingTag: string;
  closingTag?: string;
  placeholder: string;

  constructor(name: string, icon: string, openingTag: string, closingTag?: string, placeholder?: string) {
    this.name = name;
    this.icon = icon;
    this.openingTag = openingTag;
    this.closingTag = closingTag;
    this.placeholder = placeholder;
  }

  hasClosingTag() {
    return !!this.closingTag;
  }
}
