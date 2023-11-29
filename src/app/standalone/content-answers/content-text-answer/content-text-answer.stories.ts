import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { ContentTextAnswerComponent } from './content-text-answer.component';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { HttpClientModule } from '@angular/common/http';
import { AnswerOption } from '@app/core/models/answer-option';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FormattingService } from '@app/core/services/http/formatting.service';

class MockFormattingService {}

export default {
  component: ContentTextAnswerComponent,
  title: 'ContentTextAnswer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ContentTextAnswerComponent, RenderedTextComponent],
      providers: [
        {
          provide: FormattingService,
          useClass: MockFormattingService,
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

type Story = StoryObj<ContentTextAnswerComponent>;

const answerOptions = [
  new AnswerOption('answer 1'),
  new AnswerOption('answer 2'),
  new AnswerOption('answer 3'),
  new AnswerOption('answer 4'),
];

answerOptions[0].renderedLabel = '<b>answer 1</b>';

export const ContentTextAnswer: Story = {};
