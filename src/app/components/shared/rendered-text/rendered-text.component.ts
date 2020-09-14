import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormattingService, MarkdownFeatureset } from '../../../services/http/formatting.service';

@Component({
  selector: 'app-rendered-text',
  templateUrl: './rendered-text.component.html'
})
export class RenderedTextComponent implements OnChanges {

  @Input() rawText: string;
  @Input() renderedText: string;
  @Input() dynamic = false;
  @Input() markdown = true;
  @Input() latex = true;
  @Input() markdownFeatureset = MarkdownFeatureset.EXTENDED;
  @Input() linebreaks = true;
  @Output() rendered = new EventEmitter();
  displayedText: string | SafeHtml;
  isLoading = false;

  constructor(
      private formattingService: FormattingService,
      private domSanitizer: DomSanitizer
  ) {}

  ngOnChanges() {
    if (this.dynamic) {
      this.render(this.rawText);
    } else {
      this.updateDisplayedText();
    }
  }

  render(rawText: string) {
    this.isLoading = true;
    this.formattingService.postString(rawText, {
      markdown: this.markdown,
      latex: this.latex,
      markdownFeatureset: this.markdownFeatureset,
      linebreaks: this.linebreaks
    }).subscribe(renderedBody => {
      this.renderedText = renderedBody.html;
      this.updateDisplayedText();
      this.isLoading = false;
      this.rendered.emit();
    });
  }

  updateDisplayedText() {
    /* We trust the rendering backend to produce secure HTML,
     * so we can bypass Angular's sanitization which breaks LaTeX rendering. */
    this.displayedText = this.renderedText
        ? this.domSanitizer.bypassSecurityTrustHtml(this.renderedText)
        : this.rawText;
  }
}
