import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { Content } from '@app/core/models/content';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentLeaderboardComponent } from '@app/standalone/content-leaderboard/content-leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';

import { FlexModule } from '@angular/flex-layout';
import { ContentService } from '@app/core/services/http/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { throttleTime } from 'rxjs';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  imports: [FlexModule, LoadingIndicatorComponent, ContentLeaderboardComponent],
  providers: [provideTranslocoScope('participant')],
})
export class LeaderboardPageComponent implements OnInit {
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) aliasId!: string;
  @Input({ required: true }) groupId!: string;
  leaderboardItems: CurrentLeaderboardItem[] = [];
  isLoading = true;

  constructor(
    private contentGroupService: ContentGroupService,
    private contentService: ContentService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
    this.contentService
      .getAnswersChangedStream(this.content.roomId, this.content.id)
      .pipe(takeUntilDestroyed(this.destroyRef), throttleTime(5000))
      .subscribe(() => {
        this.loadLeaderboard();
      });
  }

  private loadLeaderboard(): void {
    this.contentGroupService
      .getCurrentLeaderboard(this.content.roomId, this.groupId, this.content.id)
      .subscribe((leaderboardItems) => {
        this.leaderboardItems = leaderboardItems;
        this.isLoading = false;
      });
  }
}
