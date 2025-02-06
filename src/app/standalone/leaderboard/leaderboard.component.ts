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
  imports: [CoreModule, OrdinalPipe, FlexLayoutModule],
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent implements OnChanges {
  @Input({ required: true }) leaderboardItems: LeaderboardItem[] = [];
  @Input() aliasId?: string;
  @Input() allowScrolling = false;
  @Input() showAll = false;

  dataSource?: MatTableDataSource<LeaderboardTableItem>;

  constructor(private themeService: ThemeService) {}

  ngOnChanges(): void {
    let tableItems: LeaderboardTableItem[] = [];
    this.leaderboardItems.forEach((item, index) => {
      if (index < 100) {
        tableItems.push({
          position: this.getPosition(index, item, tableItems),
          userAlias: item.userAlias,
          score: item.score,
        });
      }
    });
    const aliasItem = tableItems.find((t) => t.userAlias?.id === this.aliasId);
    if (!(this.allowScrolling || this.showAll)) {
      tableItems = tableItems.slice(0, 10);
    }
    if (this.showBelowList()) {
      if (aliasItem) {
        tableItems.push(aliasItem);
      }
    }
    this.dataSource = new MatTableDataSource(tableItems);
  }

  private getPosition(
    index: number,
    item: LeaderboardItem,
    tableItems: LeaderboardTableItem[]
  ) {
    return index > 0 && item.score === tableItems[index - 1].score
      ? tableItems[index - 1].position
      : index + 1;
  }

  private showBelowList(): boolean {
    if (this.aliasId && !this.allowScrolling) {
      return !this.leaderboardItems
        .slice(0, 10)
        .map((l) => l.userAlias?.id)
        .includes(this.aliasId);
    }
    return false;
  }

  getColor(seed?: number): string {
    return this.themeService.getTextColorFromSeed(seed);
  }
}
