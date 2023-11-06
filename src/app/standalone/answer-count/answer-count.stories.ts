import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnswerCountComponent } from './answer-count.component';
import { EventService } from '@app/core/services/util/event.service';
import { Observable, of } from 'rxjs';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';

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
      imports: [AnswerCountComponent, BrowserAnimationsModule],
      providers: [
        {
          provide: EventService,
          useClass: MockEventService,
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
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
