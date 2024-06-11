import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { BaseCardComponent } from '@app/standalone/base-card/base-card.component';
import { LeaderboardComponent } from '@app/standalone/leaderboard/leaderboard.component';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [
    NgIf,
    FlexModule,
    MatIconModule,
    TranslocoPipe,
    LeaderboardComponent,
    LoadingIndicatorComponent,
    BaseCardComponent,
  ],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.scss',
})
export class LeaderboardPageComponent implements OnInit {
  leaderboardItems: LeaderboardItem[] = [];
  isLoading = true;
  showCard: boolean;

  constructor(
    private contentGroupService: ContentGroupService,
    private route: ActivatedRoute
  ) {
    this.showCard = this.route.snapshot.data.showCard ?? true;
  }

  ngOnInit(): void {
    this.contentGroupService
      .getLeaderboard(
        this.route.snapshot.data.room.id,
        this.route.snapshot.data.contentGroup.id
      )
      .subscribe((items) => {
        this.leaderboardItems = items;
        this.isLoading = false;
      });
  }
}
