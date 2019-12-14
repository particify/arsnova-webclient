import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { ContentGroup } from '../../../models/content-group';
import { Room } from '../../../models/room';
import { MatTabGroup, MatDialog } from '@angular/material';
import { StatisticHelpComponent } from '../_dialogs/statistic-help/statistic-help.component';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.scss']
})

export class StatisticsPageComponent implements OnInit {

  room: Room;
  contentGroups: ContentGroup[] = [];
  isLoading = true;
  currentCG: ContentGroup;

  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;

  constructor(private route: ActivatedRoute,
              private roomService: RoomService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.currentCG = JSON.parse(sessionStorage.getItem('contentGroup'));
    this.getRoom(localStorage.getItem('roomId'));
    this.tabGroup.selectedIndex = 1;
  }

  getRoom(id: string): void {
    this.roomService.getStats(id).subscribe(roomStats => {
      for (let i = 0; i < roomStats.groupStats.length; i++) {
        this.roomService.getGroupByRoomIdAndName(id, roomStats.groupStats[i].groupName).subscribe(group => {
          this.contentGroups.push(group);
          if (this.currentCG.name === group.name) {
            this.tabGroup.selectedIndex = i;
          }
        });
      }
      this.isLoading = false;
    });
  }

  showHelp(): void {
    this.dialog.open(StatisticHelpComponent, {
      width: '350px'
    });
  }

}
