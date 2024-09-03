import { Component, Input, OnChanges } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { MatTableDataSource } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ThemeService } from '@app/core/theme/theme.service';

interface LeaderboardTableItem {
  position: number;
  userAlias?: RoomUserAlias;
  score: number;
}

@Component({
  standalone: true,
  imports: [CoreModule, OrdinalPipe, FlexLayoutModule],
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnChanges {
  @Input({ required: true }) leaderboardItems: LeaderboardItem[] = [];
  @Input() aliasId?: string;

  dataSource?: MatTableDataSource<LeaderboardTableItem>;
  colors: string[];

  constructor(private themeService: ThemeService) {
    this.colors = this.themeService.getTextColors();
  }

  ngOnChanges(): void {
    const tableItems: LeaderboardTableItem[] = [];
    this.leaderboardItems.forEach((item, index) => {
      if (
        index < 10 ||
        (this.showBelowList() && item.userAlias?.id === this.aliasId)
      ) {
        tableItems.push({
          position: index + 1,
          userAlias: item.userAlias,
          score: item.score,
        });
      }
    });
    this.dataSource = new MatTableDataSource(tableItems);
  }

  private showBelowList(): boolean {
    if (this.aliasId) {
      return !this.leaderboardItems
        .slice(0, 10)
        .map((l) => l.userAlias?.id)
        .includes(this.aliasId);
    }
    return false;
  }
}
