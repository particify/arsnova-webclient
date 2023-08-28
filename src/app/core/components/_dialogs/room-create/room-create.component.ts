import { Component, Inject, OnInit } from '@angular/core';
import { RoomService } from '@app/core/services/http/room.service';
import { Room } from '@app/core/models/room';
import { RoomCreated } from '@app/core/models/events/room-created';
import { Router } from '@angular/router';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from '@app/core/services/util/event.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import {
  AuthenticationProvider,
  AuthenticationProviderRole,
  AuthenticationProviderType,
} from '@app/core/models/api-config';
import { HintType } from '@app/core/models/hint-type.enum';
import { FormComponent } from '@app/standalone/form/form.component';
import { FormService } from '@app/core/services/util/form.service';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create.component.html',
})
export class RoomCreateComponent extends FormComponent implements OnInit {
  readonly dialogId = 'create-room';

  emptyInputs = false;
  newRoom = new Room();
  roomId: string;
  auth?: ClientAuthentication;
  HintType = HintType;
  anonymousProvider: AuthenticationProvider;
  createDuplication: boolean;

  constructor(
    private roomService: RoomService,
    private router: Router,
    private notification: NotificationService,
    public dialogRef: MatDialogRef<RoomCreateComponent>,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService,
    public eventService: EventService,
    private globalStorageService: GlobalStorageService,
    private apiConfigService: ApiConfigService,
    @Inject(MAT_DIALOG_DATA)
    private data: { duplicatedName?: string; roomId?: string },
    protected formService: FormService
  ) {
    super(formService);
  }

  ngOnInit() {
    this.createDuplication = !!this.data?.duplicatedName;
    if (this.createDuplication && this.data.duplicatedName) {
      this.newRoom.name = this.data.duplicatedName;
    }
    this.translateService.use(
      this.globalStorageService.getItem(STORAGE_KEYS.LANGUAGE)
    );
    this.apiConfigService.getApiConfig$().subscribe((config) => {
      this.anonymousProvider = config.authenticationProviders.filter(
        (p) => p.type === AuthenticationProviderType.ANONYMOUS
      )[0];
      this.authenticationService
        .getCurrentAuthentication()
        .subscribe((auth) => this.handleAuth(auth));
    });
  }

  resetEmptyInputs(): void {
    this.emptyInputs = false;
  }

  handleAuth(auth: ClientAuthentication) {
    this.auth = auth;
    if (!this.canCreateRoom(auth)) {
      this.dialogRef.close();
      this.router.navigateByUrl('login');
    }
  }

  canCreateRoom(auth: ClientAuthentication): boolean {
    return (
      (this.anonymousProvider &&
        this.anonymousProvider.allowedRoles.includes(
          AuthenticationProviderRole.MODERATOR
        )) ||
      (auth && auth.authProvider !== AuthProvider.ARSNOVA_GUEST)
    );
  }

  checkLogin() {
    if (!this.auth) {
      this.authenticationService.loginGuest().subscribe((result) => {
        this.auth = result.authentication;
        this.addRoom();
      });
    } else {
      this.addRoom();
    }
  }

  addRoom() {
    this.newRoom.name = this.newRoom.name.trim();
    if (!this.newRoom.name) {
      this.emptyInputs = true;
      this.translateService.get('dialog.no-empty-name').subscribe((msg) => {
        this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      });
      return;
    }
    if (this.createDuplication && this.data.roomId) {
      this.disableForm();
      this.roomService
        .duplicateRoom(this.data.roomId, false, this.newRoom.name)
        .subscribe(
          (room) => {
            this.dialogRef.close(room.name);
            const event = new RoomCreated(room.id, room.shortId);
            this.eventService.broadcast(event.type, event.payload);
            const msg = this.translateService.instant(
              'room-list.room-duplicated'
            );
            this.notification.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
          },
          () => this.enableForm()
        );
      return;
    }
    this.newRoom.abbreviation = '00000000';
    this.newRoom.description = '';
    this.newRoom.ownerId = this.auth.userId;
    this.disableForm();
    this.roomService.addRoom(this.newRoom).subscribe(
      (room) => {
        this.newRoom = room;
        const msg1 = this.translateService.instant('home-page.created-1');
        const msg2 = this.translateService.instant('home-page.created-2');
        this.notification.showAdvanced(
          msg1 + this.newRoom.name + msg2,
          AdvancedSnackBarTypes.SUCCESS
        );
        const event = new RoomCreated(room.id, room.shortId);
        this.eventService.broadcast(event.type, event.payload);
        this.router.navigate(['edit', room.shortId]);
        this.closeDialog(true);
      },
      () => this.enableForm()
    );
  }

  closeDialog(result?: boolean): void {
    this.dialogRef.close(result);
  }
}
