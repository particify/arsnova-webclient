import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { ContentGroup } from '../../../models/content-group';
import { Room } from '../../../models/room';
import { MatTabGroup } from '@angular/material/tabs';
import { DialogService } from '../../../services/util/dialog.service';

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

  @ViewChild(MatTabGroup, { static: true }) tabGroup: MatTabGroup;

  constructor(private route: ActivatedRoute,
              private roomService: RoomService,
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.currentCG = JSON.parse(sessionStorage.getItem('lastGroup'));
    this.getRoom(localStorage.getItem('roomId'));
    this.tabGroup.selectedIndex = 1;
  }

  getRoom(id: string): void {
    this.roomService.getStats(id).subscribe(roomStats => {
      for (let i = 0; i < roomStats.groupStats.length; i++) {
        this.roomService.getGroupByRoomIdAndName(id, roomStats.groupStats[i].groupName).subscribe(group => {
          this.contentGroups.push(group);
          if (this.currentCG && this.currentCG.name === group.name) {
            this.tabGroup.selectedIndex = i;
          }
        });
      }
      this.isLoading = false;
    });
  }

  showHelp(): void {
    this.dialogService.openStatisticHelpDialog();
  }
}
