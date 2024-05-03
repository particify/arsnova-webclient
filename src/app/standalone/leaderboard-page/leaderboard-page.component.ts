import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [
    CoreModule,
    TranslocoPipe,
    LeaderboardComponent,
    LoadingIndicatorComponent,
  ],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.scss',
})
export class LeaderboardPageComponent implements OnInit {
  leaderboardItems: LeaderboardItem[] = [];
  isLoading = true;

  constructor(
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.contentGroupService
      .getByRoomIdAndName(
        this.route.snapshot.data.room.id,
        this.route.snapshot.params['seriesName']
      )
      .subscribe((group) => {
        this.contentGroupService
          .getLeaderboard(this.route.snapshot.data.room.id, group.id)
          .subscribe((items) => {
            this.leaderboardItems = items;
            this.isLoading = false;
          });
      });
  }
}
