import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { take, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Room } from '@app/core/models/room';
import { ContentGroup } from '@app/core/models/content-group';
import { CoreModule } from '@app/core/core.module';
import { AnnounceService } from '@app/core/services/util/announce.service';

const REFRESH_INTERVAL = 5000;
const REFRESH_LIMIT = 100;

function setDefaultTrue(value: boolean | undefined) {
  return value ?? true;
}
@Component({
  selector: 'app-leaderboard-page',
  imports: [
    CoreModule,
    LeaderboardComponent,
    LoadingIndicatorComponent,
    BaseCardComponent,
  ],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.scss',
})
export class LeaderboardPageComponent implements OnInit {
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ transform: setDefaultTrue }) showCard!: boolean;
  @Input() showAll = false;
  leaderboardItems: LeaderboardItem[] = [];
  isLoading = true;

  constructor(
    private contentGroupService: ContentGroupService,
    private destroyRef: DestroyRef,
    private announceService: AnnounceService
  ) {}

  ngOnInit(): void {
    this.announceService.announce('creator.content.a11y-leaderboard-page-info');
    timer(0, REFRESH_INTERVAL)
      .pipe(take(REFRESH_LIMIT), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.contentGroupService
          .getLeaderboard(this.room.id, this.contentGroup.id)
          .subscribe((items) => {
            this.leaderboardItems = items;
            this.isLoading = false;
          });
      });
  }
}
