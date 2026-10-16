import {
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ContentLeaderboardComponent } from '@app/standalone/content-leaderboard/content-leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

import { FlexModule } from '@angular/flex-layout';
import { provideTranslocoScope } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LEADERBOARD_DISPLAY_LIMIT,
  watchLeaderboard,
} from '@app/core/services/util/leaderboard.service';
import {
  Content,
  LeaderboardPage,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  imports: [FlexModule, LoadingIndicatorComponent, ContentLeaderboardComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class LeaderboardPageComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private leaderboardByQuestionnaireId = inject(
    QuestionnaireLeaderboardByQuestionnaireIdGql
  );
  private leaderboardUpdated = inject(QuestionnaireLeaderboardUpdatedGql);

  @Input({ required: true }) content!: Content;
  @Input({ required: true }) aliasId!: string;
  @Input({ required: true }) groupId!: string;
  leaderboardPage: LeaderboardPage = { entries: [], totalCount: 0 };
  isLoading = true;

  ngOnInit(): void {
    watchLeaderboard(
      this.leaderboardByQuestionnaireId,
      this.leaderboardUpdated,
      {
        questionnaireId: this.groupId,
        contentId: this.content.id,
        limit: LEADERBOARD_DISPLAY_LIMIT,
      }
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.leaderboardPage = page;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Content leaderboard query failed', error);
          this.isLoading = false;
        },
      });
  }
}
