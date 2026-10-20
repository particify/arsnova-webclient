import { CdkStepperModule } from '@angular/cdk/stepper';
import { AfterViewInit, Component, input, viewChild } from '@angular/core';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { AnswerResultState, ContentAnswerResult } from '@gql/generated/graphql';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { StepperComponent } from './stepper.component';

@Component({
  selector: 'app-stepper-story',
  imports: [StepperComponent, CdkStepperModule],
  template: `
    <app-stepper [listLength]="length()" [answerResults]="answerResults()">
      @for (step of steps(); track $index) {
        <cdk-step>
          <p style="text-align: center">Content {{ $index + 1 }}</p>
        </cdk-step>
      }
    </app-stepper>
  `,
})
class StepperStoryComponent implements AfterViewInit {
  readonly length = input(3);
  readonly entryIndex = input(0);
  readonly answerResults = input<ContentAnswerResult[]>([]);
  readonly stepper = viewChild.required(StepperComponent);

  steps() {
    return Array.from({ length: this.length() });
  }

  ngAfterViewInit() {
    this.stepper().init(this.entryIndex(), this.length());
  }
}

export default {
  component: StepperStoryComponent,
  title: 'Stepper',
  decorators: [
    moduleMetadata({
      imports: [StepperStoryComponent],
      providers: [
        {
          provide: ContentAnswerService,
          useValue: {
            getAnswerResultIcon: (state?: AnswerResultState) =>
              ContentAnswerService.prototype.getAnswerResultIcon(state),
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<StepperStoryComponent>;

export const FewSteps: Story = {
  args: {
    length: 3,
  },
};

export const ManyStepsEnteredInTheMiddle: Story = {
  args: {
    length: 12,
    entryIndex: 7,
  },
};

export const WithAnswerResults: Story = {
  args: {
    length: 5,
    answerResults: [
      AnswerResultState.Correct,
      AnswerResultState.Wrong,
      AnswerResultState.Neutral,
      AnswerResultState.Abstained,
      AnswerResultState.Unanswered,
    ].map((result, i) => ({ contentId: `content-${i}`, result })),
  },
};
