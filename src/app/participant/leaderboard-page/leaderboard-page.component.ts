import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Content } from '@app/core/models/content';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentLeaderboardComponent } from '@app/standalone/content-leaderboard/content-leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { NgIf } from '@angular/common';
import { FlexModule } from '@angular/flex-layout';
import { ContentService } from '@app/core/services/http/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { throttleTime } from 'rxjs';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  standalone: true,
  imports: [
    FlexModule,
    NgIf,
    LoadingIndicatorComponent,
    ContentLeaderboardComponent,
  ],
})
export class LeaderboardPageComponent implements OnInit {
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) aliasId!: string;
  leaderboardItems: CurrentLeaderboardItem[] = [];
  isLoading = true;

  constructor(
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute,
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
      .getCurrentLeaderboard(
        this.route.snapshot.data.room.id,
        this.route.snapshot.data.contentGroup.id,
        this.content.id
      )
      .subscribe((leaderboardItems) => {
        this.leaderboardItems = leaderboardItems;
        this.isLoading = false;
      });
  }
}
