import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormattingOption, PATTERN_PLACEHOLDER } from '../../../models/formatting-option';

@Component({
  selector: 'app-formatting-toolbar',
  templateUrl: './formatting-toolbar.component.html',
  styleUrls: ['./formatting-toolbar.component.scss']
})
export class FormattingToolbarComponent {

  @Input() inputElement: HTMLTextAreaElement;
  @Output() valueChanged = new EventEmitter<string>();

  formattingOptions: FormattingOption[] = [
    new FormattingOption('bold', 'format_bold', '**', '**'),
    new FormattingOption('italic', 'format_italic', '*', '*'),
    new FormattingOption('list', 'format_list_bulleted', '* '),
    new FormattingOption('numbered-list', 'format_list_numbered', '1. '),
    new FormattingOption('code', 'code', '`', '`'),
    new FormattingOption('formulars', 'functions', '$', '$', '\\LaTeX'),
    new FormattingOption('link', 'link', '[url text](', ')', 'https://'),
    new FormattingOption('image', 'image', '![alt text](', ')', 'https://')
  ];

  constructor() {}

  addFormatting(option: FormattingOption) {
    const startPos = this.inputElement.selectionStart;
    const endPos = this.inputElement.selectionEnd;
    // Get formatted text for formatting option, current input and cursor position
    const formattedText = this.getFormattedText(this.inputElement.value, startPos, endPos, option);
    // Set new input value and focus input element
    this.setNewValueAndFocusInput(formattedText);
    // Set new cursor position
    this.setNewCursorPosition(startPos, endPos, option);
  }

  private isSelectionFormatted(text: string, cursorStart: number, cursorEnd: number, option: FormattingOption): boolean {
    return option.getPattern().test(option.hasClosingTag()
        ? this.replaceSelection(text, cursorStart, cursorEnd)
        : this.extractFromCurrentLine(text, cursorStart));
  }

  private replaceSelection(text: string, cursorStart: number, cursorEnd: number): string {
    return text.substring(0, cursorStart) + PATTERN_PLACEHOLDER + text.substring(cursorEnd);
  }

  private extractFromCurrentLine(text: string, cursorStart: number) {
    let pos = -1;
    let lineStart = 0;
    do {
      // Add 1 to start after the line break and at 0 for the first line
      lineStart = pos + 1;
      pos = text.indexOf('\n', lineStart);
    } while (pos !== -1 && pos < cursorStart)
    return text.substring(lineStart);
  }

  private getFormattedText(text: string, cursorStart: number, cursorEnd: number, option: FormattingOption): string {
    let formattedText: string;
    let lineStartPos: number;
    if (option.hasClosingTag()) {
      formattedText = text.substring(0, cursorStart) || '';
      // Add formatting sign to cursor position or start of selected text
      formattedText += option.openingTag;
      // Check if text is selected
      if (cursorStart !== cursorEnd) {
        // Add selected text
        formattedText += text.substring(cursorStart, cursorEnd);
      } else if (option.placeholder) {
        // Add placeholder if exists for formatting option
        formattedText += option.placeholder;
      }
      // Add closing tag if exists
      formattedText += option.closingTag ?? '';
    } else {
      // Insert formatting sign at line start if no text is selected and formatting option has no closing tag
      lineStartPos = text.substring(0, cursorStart).lastIndexOf('\n') + 1;
      formattedText = text.slice(0, lineStartPos) + option.openingTag + text.slice(lineStartPos);
    }
    // Add rest of text
    if (lineStartPos === undefined) {
      formattedText += text.substring(cursorEnd, text.length);
    }
    return formattedText;
  }

  private setNewValueAndFocusInput(value: string) {
    this.inputElement.value = value;
    this.valueChanged.emit(value);
    this.inputElement.focus();
  }

  private setNewCursorPosition(cursorStart: number, cursorEnd: number, option: FormattingOption) {
    let newEndPos: number;
    const signsLength = option.openingTag.length;
    // Set additional length to lengh of selection
    let additionalLength = cursorEnd - cursorStart;
    // If no text is selected and formatting option has closing tag add length of closing tag sign
      if (cursorStart !== cursorEnd && option.hasClosingTag()) {
        additionalLength += option.closingTag.length;
      }
      // Set selectionStart position to cursorStart plus inserted signs and selected text
      this.inputElement.selectionStart = cursorStart + signsLength + additionalLength;
      if (option.placeholder && cursorStart === cursorEnd) {
        // If option has placeholder and no text is selected set selectionEnd to end of placeholder
        newEndPos = cursorStart + signsLength + option.placeholder.length;
      } else {
        // Set selectionEnd to same as selectionStart
        newEndPos = this.inputElement.selectionStart;
      }
      this.inputElement.selectionEnd = newEndPos;
  }

}
