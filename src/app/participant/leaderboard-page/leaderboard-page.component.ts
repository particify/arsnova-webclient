import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { ContentLeaderboardComponent } from '@app/standalone/content-leaderboard/content-leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

import { FlexModule } from '@angular/flex-layout';
import { provideTranslocoScope } from '@jsverse/transloco';
import { Content } from '@gql/generated/graphql';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  imports: [FlexModule, LoadingIndicatorComponent, ContentLeaderboardComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [provideTranslocoScope('participant')],
})
export class LeaderboardPageComponent {
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) aliasId!: string;
  @Input({ required: true }) groupId!: string;
  leaderboardItems: CurrentLeaderboardItem[] = [];
  isLoading = true;
}
