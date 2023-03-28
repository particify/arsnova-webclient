import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormattingOption,
  PATTERN_PLACEHOLDER,
} from '@core/models/formatting-option';

@Component({
  selector: 'app-formatting-toolbar',
  templateUrl: './formatting-toolbar.component.html',
  styleUrls: ['./formatting-toolbar.component.scss'],
})
export class FormattingToolbarComponent {
  @Input() inputElement: HTMLTextAreaElement;
  @Output() valueChanged = new EventEmitter<string>();

  formattingOptions: FormattingOption[] = [
    new FormattingOption('bold', 'format_bold', '**', '**'),
    new FormattingOption('italic', 'format_italic', '_', '_'),
    new FormattingOption('list', 'format_list_bulleted', '* '),
    new FormattingOption('numbered-list', 'format_list_numbered', '1. '),
    new FormattingOption('code', 'code', '`', '`'),
    new FormattingOption('formula', 'functions', '$', '$', '\\LaTeX'),
    new FormattingOption('link', 'link', '[url text](', ')', 'https://'),
    new FormattingOption('image', 'image', '![alt text](', ')', 'https://'),
  ];

  addFormatting(option: FormattingOption) {
    const startPos = this.inputElement.selectionStart;
    const endPos = this.inputElement.selectionEnd;
    const reverse = this.isSelectionFormatted(
      this.inputElement.value,
      startPos,
      endPos,
      option
    );
    // Get formatted text for formatting option, current input and cursor position
    const formattedText = this.getFormattedText(
      this.inputElement.value,
      startPos,
      endPos,
      option,
      reverse
    );
    // Set new input value and focus input element
    this.setNewValueAndFocusInput(formattedText);
    // Set new cursor position
    this.setNewCursorPosition(startPos, endPos, option, reverse);
  }

  private isSelectionFormatted(
    text: string,
    cursorStart: number,
    cursorEnd: number,
    option: FormattingOption
  ): boolean {
    return option
      .getPattern()
      .test(
        option.hasClosingTag()
          ? this.replaceSelection(text, cursorStart, cursorEnd)
          : this.extractFromCurrentLine(text, cursorStart)
      );
  }

  private replaceSelection(
    text: string,
    cursorStart: number,
    cursorEnd: number
  ): string {
    return (
      text.substring(0, cursorStart) +
      PATTERN_PLACEHOLDER +
      text.substring(cursorEnd)
    );
  }

  private extractFromCurrentLine(text: string, cursorStart: number) {
    let pos = -1;
    let lineStart = 0;
    do {
      // Add 1 to start after the line break and at 0 for the first line
      lineStart = pos + 1;
      pos = text.indexOf('\n', lineStart);
    } while (pos !== -1 && pos < cursorStart);
    return text.substring(lineStart);
  }

  private getFormattedText(
    text: string,
    cursorStart: number,
    cursorEnd: number,
    option: FormattingOption,
    reverse: boolean
  ): string {
    let formattedText: string;
    let lineStartPos: number;

    if (option.hasClosingTag()) {
      formattedText = this.getFormattedTextWithClosingTag(
        text,
        cursorStart,
        cursorEnd,
        option,
        reverse
      );
    } else {
      lineStartPos = this.getLineStartPos(text, cursorStart);
      formattedText = this.getFormattedTextWithoutClosingTag(
        text,
        lineStartPos,
        option,
        reverse
      );
    }
    // Add rest of text
    if (lineStartPos === undefined) {
      const restStart =
        reverse && option.hasClosingTag()
          ? cursorEnd + option.closingTag.length
          : cursorEnd;
      formattedText += text.substring(restStart, text.length);
    }
    return formattedText;
  }

  private getFormattedTextWithClosingTag(
    text: string,
    cursorStart: number,
    cursorEnd: number,
    option: FormattingOption,
    reverse: boolean
  ): string {
    let formattedText = text.substring(0, cursorStart) || '';
    if (reverse) {
      formattedText = formattedText.substring(
        0,
        formattedText.length - option.openingTag.length
      );
    } else {
      // Add formatting sign to cursor position or start of selected text
      formattedText += option.openingTag;
    }
    // Check if text is selected
    if (cursorStart !== cursorEnd) {
      // Add selected text
      formattedText += text.substring(cursorStart, cursorEnd);
    } else if (option.placeholder && !reverse) {
      // Add placeholder if exists for formatting option
      formattedText += option.placeholder;
    }

    if (!reverse) {
      // Add closing tag if exists
      formattedText += option.closingTag ?? '';
    }
    return formattedText;
  }

  private getFormattedTextWithoutClosingTag(
    text: string,
    lineStartPos: number,
    option: FormattingOption,
    reverse: boolean
  ): string {
    // Insert formatting sign at line start if no text is selected and formatting option has no closing tag
    if (reverse) {
      return (
        text.slice(0, lineStartPos) +
        text.slice(lineStartPos + option.openingTag.length)
      );
    } else {
      return (
        text.slice(0, lineStartPos) +
        option.openingTag +
        text.slice(lineStartPos)
      );
    }
  }

  private getLineStartPos(text: string, cursorStart: number): number {
    return text.substring(0, cursorStart).lastIndexOf('\n') + 1;
  }

  private setNewValueAndFocusInput(value: string) {
    this.inputElement.value = value;
    this.valueChanged.emit(value);
    this.inputElement.focus();
  }

  private setNewCursorPosition(
    cursorStart: number,
    cursorEnd: number,
    option: FormattingOption,
    reverse: boolean
  ) {
    const startPosDiff = option.openingTag.length;
    let endPosDiff = startPosDiff;
    if (option.placeholder && cursorStart === cursorEnd && !reverse) {
      // Add placeholder length if applicable, no text is selected and it is no reverse operation
      endPosDiff += option.placeholder.length;
    }
    // Add or substract the difference to the selection positions
    this.inputElement.selectionStart =
      cursorStart + (reverse ? -1 : 1) * startPosDiff;
    this.inputElement.selectionEnd =
      cursorEnd + (reverse ? -1 : 1) * endPosDiff;
  }
}
