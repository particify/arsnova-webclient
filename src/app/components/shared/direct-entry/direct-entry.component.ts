import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../services/http/room.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/util/notification.service';

@Component({
  templateUrl: './direct-entry.component.html'
})
export class DirectEntryComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private roomService: RoomService,
    private translateService: TranslateService,
    private notificationService: NotificationService
  ) {
    this.route.params.subscribe(params => {
      const shortId = params['shortId'];
      this.roomService.getRoomByShortId(shortId).subscribe(room => {
        if (room) {
          this.router.navigate(['/participant/room/' + shortId]);
        }
        },
        error => {
          this.translateService.get('errors.room-not-found').subscribe(msg => {
            this.notificationService.show(msg);
          });
          this.router.navigate(['/home']);
        });
    });
  }
}
