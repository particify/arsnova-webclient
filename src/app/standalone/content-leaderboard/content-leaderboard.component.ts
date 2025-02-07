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
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';
import { provideTranslocoScope } from '@jsverse/transloco';
import {
  ContentLeaderboardTableItem,
  LeaderboardService,
} from '@app/core/services/util/leaderboard.service';

@Component({
  imports: [CoreModule, OrdinalPipe, MatSortModule],
  providers: [provideTranslocoScope('participant')],
  selector: 'app-content-leaderboard',
  templateUrl: './content-leaderboard.component.html',
  styleUrl: './content-leaderboard.component.scss',
})
export class ContentLeaderboardComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatSort) sort!: MatSort;

  @Input({ required: true }) leaderboardItems: CurrentLeaderboardItem[] = [];
  @Input({ required: true }) aliasId!: string;
  @Input() contentDuration?: number;

  dataSource?: MatTableDataSource<ContentLeaderboardTableItem>;
  displayedColumns = ['position', 'name', 'score'];

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnChanges(): void {
    if (
      this.contentDuration &&
      !this.displayedColumns.includes('currentDuration')
    ) {
      this.displayedColumns.push('currentDuration');
    }
    this.dataSource = new MatTableDataSource(
      this.leaderboardService.buildContentLeaderboardTableData(
        this.leaderboardItems,
        this.aliasId
      )
    );
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }
}
