import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoreModule } from '@app/core/core.module';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  MAX_LEADERBOARD_LIMIT,
  watchLeaderboard,
} from '@app/core/services/util/leaderboard.service';
import {
  LeaderboardPage,
  Questionnaire,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-content-group-leaderboard',
  imports: [CoreModule, LeaderboardComponent, LoadingIndicatorComponent],
  templateUrl: './content-group-leaderboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content-group-leaderboard.component.scss',
})
export class ContentGroupLeaderboardComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private announceService = inject(AnnounceService);
  private leaderboardByQuestionnaireId = inject(
    QuestionnaireLeaderboardByQuestionnaireIdGql
  );
  private leaderboardUpdated = inject(QuestionnaireLeaderboardUpdatedGql);

  @Input({ required: true }) questionnaire!: Questionnaire;
  @Input() showAll = false;
  @Input() allowScrolling = false;
  leaderboardPage: LeaderboardPage = { entries: [], totalCount: 0 };
  isLoading = true;

  ngOnInit(): void {
    this.announceService.announce('creator.content.a11y-leaderboard-page-info');
    watchLeaderboard(
      this.leaderboardByQuestionnaireId,
      this.leaderboardUpdated,
      {
        questionnaireId: this.questionnaire.id,
        // Rendering the full ranking requires it to be requested in full, since
        // the server otherwise falls back to a much smaller page.
        limit: this.showAll ? MAX_LEADERBOARD_LIMIT : undefined,
      }
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((page) => {
        this.leaderboardPage = page;
        this.isLoading = false;
      });
  }
}
