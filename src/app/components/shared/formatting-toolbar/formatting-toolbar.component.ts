import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormattingOption } from '../../../models/formatting-option';

@Component({
  selector: 'app-formatting-toolbar',
  templateUrl: './formatting-toolbar.component.html',
  styleUrls: ['./formatting-toolbar.component.scss']
})
export class FormattingToolbarComponent {

  @Input() inputElement: HTMLTextAreaElement;
  @Output() valueChanged = new EventEmitter<string>();

  formattingOptions: FormattingOption[] = [
    new FormattingOption('bold', 'format_bold', '**', true),
    new FormattingOption('italic', 'format_italic', '*', true),
    new FormattingOption('list', 'format_list_bulleted', '* '),
    new FormattingOption('numbered-list', 'format_list_numbered', '1. '),
    new FormattingOption('code', 'code', '`', true),
    new FormattingOption('formulars', 'functions', '$', true, 0, '\\LaTeX'),
    new FormattingOption('link', 'link', '[url text]()', true, 11, 'https://'),
    new FormattingOption('image', 'image', '![alt text]()', true, 12, 'https://')
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

  private getFormattedText(text: string, cursorStart: number, cursorEnd: number, option: FormattingOption): string {
    let formattedText = text.substring(0, cursorStart) || '';
    if (option.closingTag || cursorStart !== cursorEnd) {
      // Add formatting sign to cursor position or start of selected text
      formattedText += option.signs.substring(0, option.startPos || option.signs.length);
    }
    let lineStartPos: number;
    // Check if text is selected
    if (cursorStart !== cursorEnd) {
      // Add selected text
      formattedText += text.substring(cursorStart, cursorEnd);
    } else {
      if (option.closingTag) {
        if (option.placeholder) {
          // Add placeholder if exists for formatting option
          formattedText += option.placeholder;
        }
      } else {
        // Insert formatting sign at line start if no text is selected and formatting option has no closing tag 
        lineStartPos = text.substring(0, cursorStart).lastIndexOf('\n') + 1;
        formattedText = text.slice(0, lineStartPos) + option.signs + text.slice(lineStartPos);
      }
    }
    // Add closing tag if exists
    if (option.closingTag) {
      formattedText += option.signs.substring(option.startPos, option.signs.length);
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
    const signsLength = (option.startPos || option.signs.length);
    // Set additional length to lengh of selection
    let additionalLength = cursorEnd - cursorStart;
    // If no text is selected and formatting option has closing tag add length of closing tag sign
      if (cursorStart !== cursorEnd && option.closingTag) {
        additionalLength += option.signs.length - option.startPos;
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
