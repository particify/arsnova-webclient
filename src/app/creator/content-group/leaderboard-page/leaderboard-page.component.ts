import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

@Component({
  selector: 'app-leaderboard-page',
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
