import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../../services/http/room.service';
import { Room } from '../../../../models/room';
import { RoomCreated } from '../../../../models/events/room-created';
import { Router } from '@angular/router';
import { AdvancedSnackBarTypes, NotificationService } from '../../../../services/util/notification.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentService } from '../../../../services/http/content.service';
import { AuthenticationService } from '../../../../services/http/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { TSMap } from 'typescript-map';
import { EventService } from '../../../../services/util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { ClientAuthentication } from '../../../../models/client-authentication';
import { HINT_TYPES } from '@arsnova/app/components/shared/hint/hint.component';
import { AuthProvider } from '../../../../models/auth-provider';
import { ApiConfigService } from '../../../../services/http/api-config.service';
import { AuthenticationProvider, AuthenticationProviderRole, AuthenticationProviderType } from '../../../../models/api-config';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
  styleUrls: ['./room-create.component.scss']
})
export class RoomCreateComponent implements OnInit {
  longName: string;
  emptyInputs = false;
  room: Room;
  roomId: string;
  auth: ClientAuthentication;
  warningType = HINT_TYPES.WARNING;
  anonymousProvider: AuthenticationProvider;

  constructor(
    private roomService: RoomService,
    private contentService: ContentService,
    private router: Router,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<RoomCreateComponent>,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService,
    public eventService: EventService,
    private globalStorageService: GlobalStorageService,
    private apiConfigService: ApiConfigService
  ) {
  }

  ngOnInit() {
    this.translateService.use(this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE));
    this.apiConfigService.getApiConfig$().subscribe(config => {
      this.anonymousProvider = config.authenticationProviders.filter((p) => p.type === AuthenticationProviderType.ANONYMOUS)[0];
      this.authenticationService.getCurrentAuthentication().subscribe(auth => this.handleAuth(auth));
    });
  }

  resetEmptyInputs(): void {
    this.emptyInputs = false;
  }

  handleAuth(auth: ClientAuthentication) {
    this.auth = auth;
    if (!this.canCreateRoom(auth)) {
      this.dialogRef.close();
      this.router.navigate(['login']);
    }
  }

  canCreateRoom(auth: ClientAuthentication): boolean {
    return (this.anonymousProvider && this.anonymousProvider.allowedRoles.includes(AuthenticationProviderRole.MODERATOR))
        || (auth && auth.authProvider !== AuthProvider.ARSNOVA_GUEST);
  }

  checkLogin(longRoomName: string) {
    if (!this.auth) {
      this.authenticationService.loginGuest().subscribe(result => {
        this.auth = result.authentication;
        this.addRoom(longRoomName);
      });
    } else {
      this.addRoom(longRoomName);
    }
  }

  addRoom(longRoomName: string) {
    longRoomName = longRoomName.trim();
    if (!longRoomName) {
      this.emptyInputs = true;
      this.translateService.get('dialog.no-empty-name').subscribe(msg => {
        this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
      return;
    }
    const newRoom = new Room();
    const commentExtension: TSMap<string, any> = new TSMap();
    newRoom.extensions = new TSMap();
    commentExtension.set('enableModeration', true);
    newRoom.extensions.set('comments', commentExtension);
    newRoom.name = longRoomName;
    newRoom.abbreviation = '00000000';
    newRoom.description = '';
    newRoom.ownerId = this.auth.userId;
    this.roomService.addRoom(newRoom).subscribe(room => {
      this.room = room;
      let msg1: string;
      let msg2: string;
      this.translateService.get('home-page.created-1').subscribe(msg => {
        msg1 = msg;
      });
      this.translateService.get('home-page.created-2').subscribe(msg => {
        msg2 = msg;
      });
      this.notification.showAdvanced(msg1 + longRoomName + msg2, AdvancedSnackBarTypes.SUCCESS);
      const event = new RoomCreated(room.id, room.shortId);
      this.eventService.broadcast(event.type, event.payload);
      this.router.navigate([`/creator/room/${this.room.shortId}`]);
      this.closeDialog();
    });
  }


  /**
   * Returns a lambda which closes the dialog on call.
   */
  buildCloseDialogActionCallback(): () => void {
    return () => this.closeDialog();
  }


  /**
   * Returns a lambda which executes the dialog dedicated action on call.
   */
  buildRoomCreateActionCallback(room: HTMLInputElement): () => void {
    return () => this.checkLogin(room.value);
  }


  /**
   * Closes the room create dialog on call.
   */
  closeDialog(): void {
    this.dialogRef.close();
  }
}
