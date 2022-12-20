import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiState } from '../../../models/events/ui/ui-state.enum';
import { EventService } from '../../../services/util/event.service';
import { UserRole } from '../../../models/user-roles.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room-page',
  templateUrl: './room-page.component.html',
  styleUrls: ['./room-page.component.scss'],
})
export class RoomPageComponent implements OnInit, OnDestroy {
  isCreator: boolean;
  roomId: string;
  hideNavigation = false;

  navBarStateSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.isCreator = data.userRole === UserRole.CREATOR;
      this.roomId = data.room.id;
      this.navBarStateSubscription = this.eventService
        .on<boolean>(UiState.NAV_BAR_VISIBLE)
        .subscribe((isVisible) => {
          this.hideNavigation = !isVisible && !this.isCreator;
        });
    });
  }

  ngOnDestroy(): void {
    if (this.navBarStateSubscription) {
      this.navBarStateSubscription.unsubscribe();
    }
  }
}
