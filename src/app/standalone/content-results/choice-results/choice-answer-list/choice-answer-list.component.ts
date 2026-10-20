import { Component, input } from '@angular/core';

import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';

import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { ChoiceAnswerItem } from '@app/standalone/content-results/choice-results/choice-answer-list/choice-answer-item';

@Component({
  selector: 'app-choice-answer-list',
  imports: [NgClass, FlexModule, MatIcon, RenderedTextComponent],
  templateUrl: './choice-answer-list.component.html',
  styleUrls: ['./choice-answer-list.component.scss'],
})
export class ChoiceAnswerListComponent {
  readonly answers = input.required<ChoiceAnswerItem[]>();
  readonly contentAnswersDirectlyBelowChart = input<boolean>(false);
  readonly presentationMode = input(false);
  readonly showCorrect = input(false);
  readonly hasCorrectAnswer = input(false);
  readonly answerLabelWidth = input<string>();
}
