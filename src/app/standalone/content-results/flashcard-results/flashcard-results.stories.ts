import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentType } from '@gql/generated/graphql';
import { of } from 'rxjs';
import { FlashcardResultsComponent } from './flashcard-results.component';

class MockFormattingService {
  postString(text: string) {
    return of({ html: `<p>${text}</p>` });
  }
}

export default {
  component: FlashcardResultsComponent,
  title: 'FlashcardResults',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [FlashcardResultsComponent],
      providers: [
        { provide: FormattingService, useClass: MockFormattingService },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FlashcardResultsComponent>;

export const Answer: Story = {
  args: {
    formatData: {
      __typename: 'FlashcardContentFormatData',
      format: ContentType.Flashcard,
      answer: 'Canberra is the capital of **Australia**.',
    },
  },
};
