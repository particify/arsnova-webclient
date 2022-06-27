import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { IMessage } from '@stomp/stompjs';
import { Observable, Subscription } from 'rxjs';
import { UserRole } from '../../../models/user-roles.enum';
import { InfoBarItem } from '../bars/info-bar/info-bar.component';

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss']
})
export class RoomPageComponent implements OnInit, OnDestroy {

  isCreator: boolean;
  roomId: string;
  infoBarItems: InfoBarItem[] = [];

  private roomSub: Subscription;
  private roomWatch: Observable<IMessage>;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.isCreator = data.viewRole === UserRole.CREATOR;
      this.roomId = data.room.id;
      if (this.isCreator) {
        this.roomService.getRoomSummaries([data.room.id]).subscribe(summary => {
          this.infoBarItems.push(new InfoBarItem('user-counter', 'people', summary[0].stats.roomUserCount));
          this.roomWatch = this.roomService.getCurrentRoomsMessageStream();
          this.roomSub = this.roomWatch.subscribe(msg => this.parseUserCount(msg.body));
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.roomSub) {
      this.roomSub.unsubscribe();
    }
  }

  parseUserCount(body: string) {
    this.infoBarItems[0].count = JSON.parse(body).UserCountChanged.userCount;
  }

}
