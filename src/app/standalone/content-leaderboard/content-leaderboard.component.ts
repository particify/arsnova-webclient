import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreModule } from '@app/core/core.module';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';

interface LeaderboardTableItem {
  position: number;
  alias: RoomUserAlias;
  score: number;
  currentPoints: number;
  currentDuration: number;
  correct: boolean;
}

@Component({
  standalone: true,
  imports: [CoreModule, OrdinalPipe, MatSortModule],
  selector: 'app-content-leaderboard',
  templateUrl: './content-leaderboard.component.html',
  styleUrl: './content-leaderboard.component.scss',
})
export class ContentLeaderboardComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatSort) sort!: MatSort;

  @Input({ required: true }) leaderboardItems: CurrentLeaderboardItem[] = [];
  @Input({ required: true }) aliasId!: string;
  @Input() contentDuration?: number;

  dataSource?: MatTableDataSource<LeaderboardTableItem>;
  displayedColumns = ['position', 'name', 'score'];

  ngOnChanges(): void {
    if (this.contentDuration) {
      this.displayedColumns.push('currentDuration');
    }
    const tableItems: LeaderboardTableItem[] = [];
    this.leaderboardItems.forEach((item, index) => {
      if (
        index < 10 ||
        (!this.isInTopTen() && item.userAlias.id === this.aliasId)
      ) {
        tableItems.push({
          position: index + 1,
          alias: item.userAlias,
          score: item.score,
          currentPoints: item.currentResult?.points || 0,
          currentDuration: item.currentResult?.durationMs || 0,
          correct: item.currentResult?.correct,
        });
      }
    });
    this.dataSource = new MatTableDataSource(tableItems);
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

  private isInTopTen(): boolean {
    return this.leaderboardItems
      .slice(0, 10)
      .map((l) => l.userAlias.id)
      .includes(this.aliasId);
  }
}
