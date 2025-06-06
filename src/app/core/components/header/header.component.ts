import { Component, OnInit, Signal, inject } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { Router } from '@angular/router';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { EventService } from '@app/core/services/util/event.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ExtensionFactory } from '@projects/extension-point/src/public-api';
import { MatDialog } from '@angular/material/dialog';
import { AnnouncementListComponent } from '@app/standalone/announcement-list/announcement-list.component';
import { AnnouncementService } from '@app/core/services/http/announcement.service';
import { AnnouncementState } from '@app/core/models/announcement-state';
import {
  ChangeType,
  EntityChangeNotification,
} from '@app/core/models/events/entity-change-notification';
import { Room } from '@app/core/models/room';
import { RoomService } from '@app/core/services/http/room.service';
import { DrawerService } from '@app/core/services/util/drawer.service';
import { CustomPageTitleStrategy } from '@app/core/custom-title-strategy';
import { PageTitleService } from '@app/core/services/util/page-title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [CustomPageTitleStrategy],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  router = inject(Router);
  eventService = inject(EventService);
  private dialogService = inject(DialogService);
  private routingService = inject(RoutingService);
  private extensionFactory = inject(ExtensionFactory);
  private dialog = inject(MatDialog);
  private announcementService = inject(AnnouncementService);
  private roomService = inject(RoomService);
  private drawerService = inject(DrawerService);
  private pageTitleService = inject(PageTitleService);

  auth?: ClientAuthentication;

  role?: UserRole;
  UserRole: typeof UserRole = UserRole;

  isRoom = false;
  isPreview = false;
  userCharacter?: string;
  openPresentationDirectly = false;
  showOverlayLink = false;
  announcementState?: AnnouncementState;
  room?: Room;
  title: Signal<string>;

  constructor() {
    this.title = this.pageTitleService.getTitle();
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().subscribe((auth) => {
      this.auth = auth;
      this.userCharacter = this.auth?.displayId
        ?.slice(0, 1)
        .toLocaleUpperCase();
      this.getAnnouncementState();
    });
    this.eventService
      .on('EntityChangeNotification')
      .subscribe((notification) => {
        if (this.role !== UserRole.OWNER) {
          const entityType = (notification as EntityChangeNotification).payload
            .entityType;
          const changeType = (notification as EntityChangeNotification).payload
            .changeType;
          if (
            entityType === 'Announcement' &&
            [ChangeType.CREATE, ChangeType.UPDATE].includes(changeType)
          ) {
            this.getAnnouncementState();
          }
        }
      });
    this.roomService
      .getCurrentRoomStream()
      .subscribe((room) => (this.room = room));
    this.isPreview = this.routingService.isPreview;
    this.routingService.getIsPreview().subscribe((isPreview) => {
      this.isPreview = isPreview;
    });
    this.role = this.routingService.role;
    this.routingService.getRole().subscribe((role) => {
      this.role = role;
    });
    this.openPresentationDirectly =
      !this.extensionFactory.getExtension('present-in-new-tab');
    this.showOverlayLink =
      !!this.extensionFactory.getExtension('overlay-menu-link');
  }

  toggleDrawer(): void {
    this.drawerService.toggleDrawer();
  }

  getAnnouncementState() {
    if (this.auth) {
      this.announcementService
        .getStateByUserId(this.auth.userId)
        .subscribe((state) => {
          this.announcementState = state;
        });
    } else {
      this.announcementState = undefined;
    }
  }

  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  isGuest(): boolean {
    return !this.auth || this.auth.authProvider === AuthProvider.ARSNOVA_GUEST;
  }

  presentCurrentView(shouldOpen = this.openPresentationDirectly) {
    if (shouldOpen) {
      this.routingService.navToPresentation();
    }
  }

  checkIfOpenPresentationDirectly(isVisble: boolean) {
    this.openPresentationDirectly = !isVisble;
  }

  switchRole() {
    this.routingService.switchRole();
  }

  goToSettings() {
    this.routingService.navToSettings();
  }

  showNews() {
    const dialogRef = this.dialog.open(AnnouncementListComponent, {
      panelClass: 'dialog-margin',
      width: '90%',
      maxWidth: '872px',
      data: {
        state: this.announcementState,
      },
    });
    dialogRef.afterClosed().subscribe((newReadTimestamp) => {
      if (this.announcementState) {
        this.announcementState.readTimestamp = newReadTimestamp;
      }
    });
  }
}
