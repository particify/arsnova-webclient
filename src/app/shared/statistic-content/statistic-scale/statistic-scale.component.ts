import { Component } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { forkJoin, Observable } from 'rxjs';
import { ThemeService } from '@app/core/theme/theme.service';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentService } from '@app/core/services/http/content.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { StatisticChoiceComponent } from '@app/shared/statistic-content/statistic-choice/statistic-choice.component';
import { EventService } from '@app/core/services/util/event.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { AnswerStatistics } from '@app/core/models/answer-statistics';

@Component({
  selector: 'app-statistic-scale',
  templateUrl: '../statistic-choice/statistic-choice.component.html',
  styleUrls: ['../statistic-choice/statistic-choice.component.scss'],
})
export class StatisticScaleComponent extends StatisticChoiceComponent {
  constructor(
    protected contentService: ContentService,
    protected translateService: TranslocoService,
    protected themeService: ThemeService,
    protected eventService: EventService,
    protected presentationService: PresentationService,
    private likertScaleService: LikertScaleService
  ) {
    super(
      contentService,
      translateService,
      themeService,
      eventService,
      presentationService
    );
  }

  init(stats: AnswerStatistics) {
    const scaleContent = this.content as ContentScale;
    const scaleOptions = this.likertScaleService.getOptionLabels(
      scaleContent.optionTemplate,
      scaleContent.optionCount
    );
    if (scaleOptions) {
      const optionLabels$ = scaleOptions.map(
        (l) => this.translateService.selectTranslate(l) as Observable<string>
      );
      forkJoin(optionLabels$).subscribe(
        (labels) => (this.options = labels.map((l) => ({ label: l })))
      );
    }
    this.correctOptionIndexes = [];
    super.init(stats);
  }
}
