import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  auth?: ClientAuthentication;

  role?: UserRole;
  UserRole: typeof UserRole = UserRole;

  isRoom = false;
  isPreview = false;
  userCharacter?: string;
  openPresentationDirectly = false;
  announcementState?: AnnouncementState;
  room?: Room;

  constructor(
    private authenticationService: AuthenticationService,
    public router: Router,
    public eventService: EventService,
    private dialogService: DialogService,
    private routingService: RoutingService,
    private extensionFactory: ExtensionFactory,
    private dialog: MatDialog,
    private announcementService: AnnouncementService,
    private roomService: RoomService,
    private drawerService: DrawerService
  ) {}

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

  goBack() {
    this.routingService.goBack();
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

  leaveRoom() {
    const dialogRef = this.dialogService.openDeleteDialog(
      'leave-room',
      'dialog.really-leave-room',
      undefined,
      'dialog.leave'
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigateByUrl('user');
      }
    });
  }
}
