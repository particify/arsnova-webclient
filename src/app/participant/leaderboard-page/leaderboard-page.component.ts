import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Content } from '@app/core/models/content';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
})
export class LeaderboardPageComponent implements OnInit {
  @Input({ required: true }) content!: Content;
  @Input({ required: true }) aliasId!: string;
  leaderboardItems: CurrentLeaderboardItem[] = [];
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
          .getCurrentLeaderboard(
            this.route.snapshot.data.room.id,
            group.id,
            this.content.id
          )
          .subscribe((leaderboardItems) => {
            this.leaderboardItems = leaderboardItems;
            this.isLoading = false;
          });
      });
  }
}
