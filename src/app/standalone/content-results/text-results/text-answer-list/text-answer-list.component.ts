import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { TextAnswerItem } from './text-answer-item';

@Component({
  selector: 'app-text-answer-list',
  templateUrl: './text-answer-list.component.html',
  styleUrls: ['./text-answer-list.component.scss'],
  imports: [
    NgClass,
    FlexModule,
    MatIconButton,
    MatTooltip,
    MatIcon,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('creator')],
})
export class TextAnswerListComponent {
  readonly answers = input.required<TextAnswerItem[]>();
  readonly hidingAllowed = input(false);
  readonly hideClicked = output<TextAnswerItem>();
}
