import { Component, DestroyRef, Input, OnInit } from '@angular/core';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
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

@Component({
  selector: 'app-content-group-leaderboard',
  imports: [CoreModule, LeaderboardComponent, LoadingIndicatorComponent],
  templateUrl: './content-group-leaderboard.component.html',
  styleUrl: './content-group-leaderboard.component.scss',
})
export class ContentGroupLeaderboardComponent implements OnInit {
  @Input({ required: true }) room!: Room;
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input() showAll = false;
  @Input() allowScrolling = false;
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
