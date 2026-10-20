import { Component, input } from '@angular/core';
import { FlashcardContentFormatData } from '@gql/generated/graphql';
import { MarkdownFeatureset } from '@app/core/services/http/formatting.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { DividerComponent } from '@app/standalone/divider/divider.component';

@Component({
  selector: 'app-flashcard-results',
  templateUrl: './flashcard-results.component.html',
  imports: [DividerComponent, RenderedTextComponent],
})
export class FlashcardResultsComponent {
  formatData = input.required<FlashcardContentFormatData>();
  roundIds = input<string[]>([]);
  resultsVisible = input(true);

  readonly markdownFeatureset = MarkdownFeatureset.EXTENDED;
}
