import {
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { SelectableAnswer } from '@app/core/models/selectable-answer';
import { LanguageService } from '@app/core/services/util/language.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { TranslocoService } from '@jsverse/transloco';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-content-choice-answer',
  imports: [CoreModule, RenderedTextComponent],
  templateUrl: './content-choice-answer.component.html',
  styleUrls: ['./content-choice-answer.component.scss'],
})
export class ContentChoiceAnswerComponent {
  private languageService = inject(LanguageService);
  private translateService = inject(TranslocoService);

  readonly answerOptions = model.required<SelectableAnswer[]>();
  readonly correctOptionsPublished = input<boolean>(false);
  readonly correctOptionIndexes = input<number[] | undefined>();
  readonly answered = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly multipleAnswersAllowed = input<boolean>(false);
  readonly dynamicRendering = input<boolean>(false);
  readonly translateOptions = input<boolean>(false);
  readonly language = input<string | undefined>();

  readonly correctOptionVisible = computed(() =>
    this.displayAnswers().map(
      (_, i) =>
        this.answered() &&
        !!this.correctOptionIndexes()?.length &&
        this.correctOptionsPublished() &&
        (this.displayAnswers()[i].checked || this.isAnswerOptionCorrect(i))
    )
  );

  readonly checkedOptions = computed(() =>
    this.displayAnswers().map((answer, index) => {
      const checked = this.answered() && answer.checked;
      const correct = checked && this.isAnswerOptionCorrect(index);
      return {
        correct: correct && this.correctOptionsPublished(),
        incorrect: checked && !correct && this.correctOptionsPublished(),
      };
    })
  );

  private readonly labelsToTranslate = computed(
    () =>
      this.translateOptions()
        ? {
            labels: this.answerOptions().map((o) => o.answerOption.label),
            lang: this.languageService.ensureValidLang(this.language()),
          }
        : undefined,
    {
      // A selection replaces the options, but must not translate them again.
      equal: (a, b) =>
        a?.lang === b?.lang &&
        a?.labels.length === b?.labels.length &&
        !!a?.labels.every((label, i) => label === b?.labels[i]),
    }
  );

  // Translating resolves asynchronously, so it runs outside the reactive context.
  private readonly translatedLabels = toSignal(
    toObservable(this.labelsToTranslate).pipe(
      switchMap((toTranslate) =>
        toTranslate
          ? forkJoin(
              toTranslate.labels.map((label) =>
                this.translateService.selectTranslate(
                  label,
                  undefined,
                  toTranslate.lang
                )
              )
            )
          : of(undefined)
      )
    )
  );

  readonly displayAnswers = linkedSignal(() => {
    if (!this.translateOptions()) {
      return this.answerOptions();
    }

    const labels = this.translatedLabels() ?? [];
    return this.answerOptions()
      .slice(0, labels.length)
      .map(
        (o, i) =>
          new SelectableAnswer(
            { label: labels[i], renderedLabel: labels[i] },
            o.checked
          )
      );
  });

  updateSelection(index: number) {
    this.answerOptions.update((answers) => {
      if (this.multipleAnswersAllowed()) {
        return answers.map((a, i) =>
          i === index ? { ...a, checked: !a.checked } : a
        );
      } else {
        return answers.map((a, i) => ({ ...a, checked: i === index }));
      }
    });
  }

  isAnswerOptionCorrect(index: number): boolean {
    const correctOptionIndexes = this.correctOptionIndexes();
    return !!correctOptionIndexes && correctOptionIndexes.includes(index);
  }
}
