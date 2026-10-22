import {
  Component,
  DestroyRef,
  ElementRef,
  OutputRefSubscription,
  Signal,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ContentService } from '@app/core/services/http/content.service';
import { HintType } from '@app/core/models/hint-type.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FlexModule } from '@angular/flex-layout';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { HotkeyDirective } from '@app/core/directives/hotkey.directive';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/autocomplete';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { FormattingToolbarComponent } from '@app/standalone/formatting-toolbar/formatting-toolbar.component';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Dir } from '@angular/cdk/bidi';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { MatTooltip } from '@angular/material/tooltip';
import { NgStyle, AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { BinaryContentFormComponent } from './binary-content-form/binary-content-form.component';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { CoreModule } from '@app/core/core.module';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import {
  Content,
  ContentType,
  Questionnaire,
  QuestionnaireContentByIdGql,
  QuestionnaireType,
} from '@gql/generated/graphql';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { onlyCompleteData } from 'apollo-angular';
import { map, of, switchMap } from 'rxjs';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { FORM_REGISTRY } from './form-registry';
import { WordcloudContentFormComponent } from './wordcloud-content-form/wordcloud-content-form.component';
import { FlashcardContentFormComponent } from './flashcard-content-form/flashcard-content-form.component';
import { SlideContentFormComponent } from './slide-content-form/slide-content-form.component';
import { NumericContentFormComponent } from './numeric-content-form/numeric-content-form.component';
import { PrioritizationContentFormComponent } from './prioritization-content-form/prioritization-content-form.component';
import { ScaleContentFormComponent } from './scale-content-form/scale-content-form.component';
import { ShortAnswerContentFormComponent } from './short-answer-content-form/short-answer-content-form.component';
import { SortContentFormComponent } from './sort-content-form/sort-content-form.component';
import { TextContentFormComponent } from './text-content-form/text-content-form.component';

interface ContentFormat {
  type: ContentType;
  name: string;
  icon: string;
}

export const DURATION_RANGE = { min: 10, max: 600 };
export const WEIGHT_RANGE = { min: 1, max: 5 };

function isInRange(value: number, range: { min: number; max: number }) {
  return Number.isInteger(value) && value >= range.min && value <= range.max;
}

@Component({
  selector: 'app-content-editing',
  templateUrl: './content-editing.component.html',
  styleUrls: ['./content-editing.component.scss'],
  imports: [
    FlexModule,
    MatFormField,
    MatSelect,
    HotkeyDirective,
    MatSelectTrigger,
    MatIcon,
    MatOption,
    MatTabNav,
    MatTabLink,
    MatTabNavPanel,
    FormsModule,
    AutofocusDirective,
    FormattingToolbarComponent,
    MatLabel,
    MatInput,
    CdkTextareaAutosize,
    Dir,
    HintComponent,
    MatTooltip,
    NgStyle,
    ExtendedModule,
    MatButton,
    RouterLink,
    LoadingButtonComponent,
    AsyncPipe,
    A11yIntroPipe,
    TranslocoPipe,
    CoreModule,
    SettingsSlideToggleComponent,
    RenderedTextComponent,
  ],
})
export class ContentEditingComponent {
  private readonly translateService = inject(TranslocoService);
  private readonly announceService = inject(AnnounceService);
  private readonly formattingService = inject(FormattingService);
  private readonly contentService = inject(ContentService);
  private readonly contentGroupService = inject(ContentGroupService);
  private readonly notificationService = inject(NotificationService);
  private readonly contentPublishService = inject(ContentPublishService);
  private readonly contentById = inject(QuestionnaireContentByIdGql);

  private readonly formComponentOutlet =
    viewChild<NgComponentOutlet>(NgComponentOutlet);
  private readonly contentForm: Signal<
    | BinaryContentFormComponent
    | ChoiceContentFormComponent
    | WordcloudContentFormComponent
    | FlashcardContentFormComponent
    | NumericContentFormComponent
    | PrioritizationContentFormComponent
    | ScaleContentFormComponent
    | ShortAnswerContentFormComponent
    | SlideContentFormComponent
    | SortContentFormComponent
    | TextContentFormComponent
    | undefined
  > = computed(() => {
    // componentInstance is no signal: the outlet swaps it on a format change.
    this.formatComponent();
    return this.formComponentOutlet()?.componentInstance ?? undefined;
  });
  private readonly bodyInput = viewChild.required<ElementRef>('questionInput');
  readonly formatComponent = computed(() => {
    const format = this.selectedFormat()?.type;
    if (!format) return;
    return FORM_REGISTRY[format];
  });

  /** The inputs every format form declares, whatever else it adds. */
  private sharedInputs() {
    const content = this.content();
    return {
      contentId: content?.id,
      duration: this.duration(),
      preview: this.isPreview(),
      formatData: content?.formatData,
      abstentionsAllowed: this.abstentionsAllowed(),
    };
  }

  readonly componentInputs = computed(() => {
    const format = this.selectedFormat()?.type;
    const base = this.sharedInputs();
    if (format === ContentType.Binary) {
      return {
        ...base,
        weight: this.weight(),
        answered: this.answered(),
        hasCorrectAnswer: this.hasCorrectAnswer(),
      };
    }
    if (format === ContentType.Choice) {
      return {
        ...base,
        multiple: this.multiple(),
        weight: this.weight(),
        answered: this.answered(),
        hasCorrectAnswer: this.hasCorrectAnswer(),
      };
    }
    if (format === ContentType.Numeric) {
      return {
        ...base,
        weight: this.weight(),
        answered: this.answered(),
        hasCorrectAnswer: this.hasCorrectAnswer(),
      };
    }
    if (format === ContentType.Prioritization) {
      return {
        ...base,
        answered: this.answered(),
      };
    }
    if (format === ContentType.Scale) {
      return {
        ...base,
        neutralOption: this.neutralOption(),
        answered: this.answered(),
        language: this.language(),
      };
    }
    if (format === ContentType.Wordcloud) {
      return {
        ...base,
        answered: this.answered(),
      };
    }
    if (format === ContentType.ShortAnswer || format === ContentType.Sort) {
      return {
        ...base,
        weight: this.weight(),
        answered: this.answered(),
      };
    }
    return base;
  });

  readonly questionnaire = input.required<Questionnaire>();

  readonly content = input<Content>();
  readonly multiple = linkedSignal(() => {
    const formatData = this.content()?.formatData;
    return formatData?.__typename === 'ChoiceContentFormatData'
      ? !!formatData.multiple
      : false;
  });
  readonly neutralOption = linkedSignal<boolean | undefined, boolean>({
    source: () => {
      const formatData = this.content()?.formatData;
      return formatData?.__typename === 'ScaleContentFormatData'
        ? !!formatData.neutralOption
        : undefined;
    },
    /**
     * linkedSignal re-seeds on any content change, so the persisted flag is
     * compared explicitly to keep a toggle the creator just flipped.
     */
    computation: (persisted, previous) =>
      previous && persisted === previous.source
        ? previous.value
        : (persisted ?? previous?.value ?? true),
  });
  readonly question = linkedSignal(() => this.content()?.body ?? '');
  readonly weight = linkedSignal(() => this.content()?.weight ?? 1);
  readonly duration = linkedSignal(() => this.content()?.duration);
  readonly abstentionsAllowed = linkedSignal(
    () => this.content()?.abstentionsAllowed ?? true
  );
  readonly hasCorrectAnswer = linkedSignal(
    () =>
      this.content()?.hasCorrectAnswer ??
      this.questionnaire().type === QuestionnaireType.Quiz
  );

  /**
   * The content as cached, where live answers arrive while the editor is
   * open. Only the lock follows it: the form keeps what it was seeded with,
   * as every pushed answer count would otherwise re-seed it.
   */
  private readonly cachedContent = toSignal(
    toObservable(computed(() => this.content()?.id)).pipe(
      switchMap((id) =>
        id
          ? this.contentById
              .watch({ variables: { id }, fetchPolicy: 'cache-first' })
              .valueChanges.pipe(
                onlyCompleteData(),
                map((r) => r.data.questionnaireContentById)
              )
          : of(undefined)
      )
    )
  );

  readonly answered = computed(
    () => !!(this.cachedContent()?.hasAnswers ?? this.content()?.hasAnswers)
  );

  // Route data input below
  fixedHeight = input(false);
  language = input.required<string>();

  ContentType = ContentType;

  isPreview = signal(false);
  textContainsImage = false;
  HintType = HintType;
  isLoading = true;
  readonly created = signal(false);
  QuestionnaireType = QuestionnaireType;
  questionMaxLength = 2000;

  readonly formats = computed(() => {
    const iconList = this.contentService.getTypeIcons();
    const supportedTypes =
      this.contentGroupService.getContentFormatsOfQuestionnaireType(
        this.questionnaire().type
      );

    return supportedTypes
      .filter((type) => iconList.has(type))
      .map((type) => ({
        type,
        name: type.toLowerCase(),
        icon: iconList.get(type)!,
      }));
  });

  selectedFormat = linkedSignal(() =>
    this.content()
      ? this.formats().find((f) => f.type === this.content()?.formatData.format)
      : this.formats()[0]
  );
  formatData = linkedSignal(() => this.content()?.formatData);

  constructor() {
    let submittedSubscription: OutputRefSubscription | undefined;
    afterRenderEffect(() => {
      const form = this.contentForm();
      submittedSubscription?.unsubscribe();
      submittedSubscription = form?.submitted.subscribe(() =>
        this.afterCreation()
      );
    });
    inject(DestroyRef).onDestroy(() => {
      submittedSubscription?.unsubscribe();
    });
  }

  formatChanged($event: ContentFormat) {
    this.selectedFormat.set($event);
  }

  private prepareContent(): boolean {
    const error = this.question()
      ? this.determineSettingsError()
      : this.translateService.translate(
          'creator.content.no-empty-fields-allowed'
        );
    if (error) {
      this.notificationService.showAdvanced(
        error,
        AdvancedSnackBarTypes.WARNING
      );
      return false;
    }
    return true;
  }

  private determineSettingsError(): string | undefined {
    const duration = this.duration();
    if (duration != null && !isInRange(duration, DURATION_RANGE)) {
      return this.translateService.translate(
        'creator.content.timer-out-of-range',
        DURATION_RANGE
      );
    }
    if (!isInRange(this.weight(), WEIGHT_RANGE)) {
      return this.translateService.translate(
        'creator.content.weight-out-of-range',
        WEIGHT_RANGE
      );
    }
    return undefined;
  }

  togglePreview() {
    if (this.isPreview()) {
      this.showEditing();
    } else {
      if (this.prepareContent() && this.contentForm()?.formatDataValid()) {
        this.isPreview.set(true);
      }
    }
  }

  updateTextContainsImage(text: string) {
    this.textContainsImage = this.formattingService.containsTextAnImage(text);
  }

  setDuration(value: string): void {
    this.duration.set(value.trim() === '' ? null : Number(value));
  }

  setWeight(value: string): void {
    this.weight.set(Number(value));
  }

  submitContent(): void {
    if (!this.prepareContent()) {
      return;
    }
    this.contentForm()?.submit(this.questionnaire().id, this.question());
  }

  isLiveMode(): boolean {
    return this.contentPublishService.isLive(this.questionnaire());
  }

  afterCreation() {
    this.question.set('');
    setTimeout(() => {
      this.bodyInput().nativeElement.focus();
    });
    this.created.set(true);
    setTimeout(() => {
      this.created.set(false);
    }, 300);
  }

  private showEditing() {
    this.isPreview.set(false);
    this.announceService.announce('creator.content.a11y-back-in-creation');
  }
}
