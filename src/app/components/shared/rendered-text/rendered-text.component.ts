import { Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormattingService, MarkdownFeatureset } from '../../../services/http/formatting.service';

@Component({
  selector: 'app-rendered-text',
  templateUrl: './rendered-text.component.html',
  styleUrls: ['./rendered-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RenderedTextComponent implements OnChanges {

  @Input() rawText: string;
  @Input() renderedText: string;
  @Input() dynamic = false;
  @Input() markdown = true;
  @Input() latex = true;
  @Input() syntaxHighlighting = true;
  @Input() markdownFeatureset = MarkdownFeatureset.EXTENDED;
  @Input() linebreaks = true;
  @Input() isPresentation = false;
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
      syntaxHighlighting: this.syntaxHighlighting,
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
    if (this.isPresentation) {
      //this.renderedText = this.renderedText.split('p>').join( 'h2>');
    }
    this.displayedText = this.renderedText
        ? this.domSanitizer.bypassSecurityTrustHtml(this.renderedText)
        : this.rawText;
  }
}
