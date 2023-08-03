import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { FormattingService } from '@app/core/services/http/formatting.service';
import { Observable, of } from 'rxjs';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

class MockFormattingService {
  postString(text: string): Observable<string> {
    return of(text);
  }
}
export default {
  component: RenderedTextComponent,
  title: 'RenderedText',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<RenderedTextComponent>;

export const RenderedText: Story = {
  args: {
    rawText: 'This is a raw text.',
  },
};
