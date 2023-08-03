import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnswerCountComponent } from './answer-count.component';
import { EventService } from '@app/core/services/util/event.service';
import { Observable, of } from 'rxjs';

class MockEventService {
  on(): Observable<boolean> {
    return of(true);
  }
}

export default {
  component: AnswerCountComponent,
  title: 'AnswerCount',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot(),
        AnswerCountComponent,
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AnswerCountComponent>;

export const AnswerCount: Story = {
  args: {
    count: 42,
  },
};
