import { Component, Input } from '@angular/core';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { forkJoin, Observable, take } from 'rxjs';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentService } from '@app/core/services/http/content.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { StatisticChoiceComponent } from '@app/standalone/statistic-content/statistic-choice/statistic-choice.component';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { MatIcon } from '@angular/material/icon';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgClass } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { LanguageService } from '@app/core/services/util/language.service';
import { CorrectAnswerResultsComponent } from '@app/standalone/correct-answer-results/correct-answer-results.component';

@Component({
  selector: 'app-statistic-scale',
  templateUrl: '../statistic-choice/statistic-choice.component.html',
  styleUrls: ['../statistic-choice/statistic-choice.component.scss'],
  imports: [
    FlexModule,
    LoadingIndicatorComponent,
    NgClass,
    RenderedTextComponent,
    MatIcon,
    TranslocoPipe,
    CorrectAnswerResultsComponent,
  ],
})
export class StatisticScaleComponent extends StatisticChoiceComponent {
  @Input() language?: string;

  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService,
    protected themeService: ThemeService,
    protected presentationService: PresentationService,
    private likertScaleService: LikertScaleService,
    private languageService: LanguageService
  ) {
    super(contentService, translateService, themeService, presentationService);
  }

  init(stats: AnswerStatistics) {
    this.language = this.languageService.ensureValidLang(this.language);
    const scaleContent = this.content as ContentScale;
    const scaleOptions = this.likertScaleService.getOptionLabels(
      scaleContent.optionTemplate,
      scaleContent.optionCount
    );
    if (scaleOptions) {
      const optionLabels$ = scaleOptions.map(
        (l) =>
          this.translateService
            .selectTranslate(l, undefined, this.language)
            .pipe(take(1)) as Observable<string>
      );
      forkJoin(optionLabels$).subscribe((labels) => {
        this.options = labels.map((l) => ({ label: l }));
        this.correctOptionIndexes = [];
        super.init(stats);
      });
    }
  }
}
