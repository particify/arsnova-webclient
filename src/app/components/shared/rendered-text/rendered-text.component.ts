import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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
  @Input() latex = false;
  @Input() markdownFeatureset = MarkdownFeatureset.EXTENDED;
  @Input() linebreaks = true;
  @Output() rendered = new EventEmitter();
  isLoading = false;

  constructor(private formattingService: FormattingService) {}

  ngOnChanges() {
    if (this.dynamic) {
      this.render(this.rawText);
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
      this.isLoading = false;
      this.rendered.emit();
    });
  }
}
