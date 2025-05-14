import { Component, Input, OnChanges, inject } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { MatTableDataSource } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  LeaderboardService,
  LeaderboardTableItem,
} from '@app/core/services/util/leaderboard.service';

@Component({
  imports: [CoreModule, OrdinalPipe, FlexLayoutModule],
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnChanges {
  private leaderboardService = inject(LeaderboardService);

  @Input({ required: true }) leaderboardItems: LeaderboardItem[] = [];
  @Input() aliasId?: string;
  @Input() allowScrolling = false;
  @Input() showAll = false;

  dataSource?: MatTableDataSource<LeaderboardTableItem>;

  ngOnChanges(): void {
    this.dataSource = new MatTableDataSource(
      this.leaderboardService.buildLeaderboardTableData(
        this.leaderboardItems,
        this.aliasId,
        this.showAll
      )
    );
  }
}
