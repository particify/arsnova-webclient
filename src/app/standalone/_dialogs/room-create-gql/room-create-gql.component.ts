import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import {
  AuthenticationProvider,
  AuthenticationProviderRole,
  AuthenticationProviderType,
} from '@app/core/models/api-config';
import { AuthProvider } from '@app/core/models/auth-provider';
import { ClientAuthentication } from '@app/core/models/client-authentication';
import { RoomCreated } from '@app/core/models/events/room-created';
import { HintType } from '@app/core/models/hint-type.enum';
import { Room } from '@app/core/models/room';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EventService } from '@app/core/services/util/event.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { CreateRoomGql, DuplicateRoomGql } from '@gql/generated/graphql';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { take } from 'rxjs';

@Component({
  selector: 'app-room-create',
  templateUrl: './room-create-gql.component.html',
  imports: [
    ExtensionPointModule,
    FormsModule,
    HintComponent,
    LoadingButtonComponent,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatFormField,
    MatHint,
    MatInput,
    MatLabel,
    TranslocoPipe,
  ],
})
export class RoomCreateGqlComponent extends FormComponent implements OnInit {
  private apiConfigService = inject(ApiConfigService);
  private authenticationService = inject(AuthenticationService);
  private dialogRef = inject(MatDialogRef<RoomCreateGqlComponent>);
  private eventService = inject(EventService);
  private globalStorageService = inject(GlobalStorageService);
  private notification = inject(NotificationService);
  private createRoomGql = inject(CreateRoomGql);
  private duplicateRoomGql = inject(DuplicateRoomGql);
  private router = inject(Router);
  private translateService = inject(TranslocoService);
  private data: {
    prefilledName?: string;
    roomId?: string;
    navigateAfterCreation: boolean;
  } = inject(MAT_DIALOG_DATA);

  readonly dialogId = 'create-room';

  emptyInputs = false;
  newRoom = new Room();
  auth?: ClientAuthentication;
  HintType = HintType;
  anonymousProvider?: AuthenticationProvider;
  createDuplication = false;

  ngOnInit() {
    this.createDuplication = !!this.data?.prefilledName;
    if (this.createDuplication && this.data.prefilledName) {
      this.newRoom.name = this.data.prefilledName;
    }
    this.translateService.setActiveLang(
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
    if (this.auth) {
      this.addRoom(this.auth);
    } else {
      this.authenticationService.loginGuest().subscribe((result) => {
        if (result.authentication) {
          this.addRoom(result.authentication);
        }
      });
    }
  }

  private addRoom(auth: ClientAuthentication) {
    this.newRoom.name = this.newRoom.name.trim();
    if (!this.newRoom.name) {
      this.emptyInputs = true;
      this.translateService
        .selectTranslate('dialog.no-empty-name')
        .pipe(take(1))
        .subscribe((msg) => {
          this.notification.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
        });
      return;
    }
    if (this.createDuplication && this.data.roomId) {
      this.disableForm();
      this.duplicateRoomGql
        .mutate({ id: this.data.roomId, newName: this.newRoom.name })
        .subscribe({
          next: (r) => {
            if (!r.data) {
              return;
            }
            const roomData = r.data.duplicateRoom;
            this.dialogRef.close(this.newRoom.name);
            const event = new RoomCreated(roomData.id, roomData.shortId);
            this.eventService.broadcast(event.type, event.payload);
            const msg = this.translateService.translate(
              'room-list.room-duplicated'
            );
            this.notification.showAdvanced(msg, AdvancedSnackBarTypes.SUCCESS);
          },
          error: () => this.enableForm(),
        });
      return;
    }
    this.newRoom.abbreviation = '00000000';
    this.newRoom.description = '';
    this.newRoom.ownerId = auth.userId;
    this.disableForm();
    this.createRoomGql.mutate({ name: this.newRoom.name }).subscribe({
      next: (r) => {
        if (!r.data) {
          return;
        }
        const roomData = r.data.createRoom;
        const room = new Room();
        room.id = roomData.id;
        room.shortId = roomData.shortId;
        room.name = this.newRoom.name;
        const msg1 = this.translateService.translate('home-page.created-1');
        const msg2 = this.translateService.translate('home-page.created-2');
        this.notification.showAdvanced(
          msg1 + this.newRoom.name + msg2,
          AdvancedSnackBarTypes.SUCCESS
        );
        const event = new RoomCreated(roomData.id, roomData.shortId);
        this.eventService.broadcast(event.type, event.payload);
        if (this.data.navigateAfterCreation) {
          this.router.navigate(['edit', roomData.shortId]);
        }
        this.closeDialog(this.newRoom);
      },
      error: () => this.enableForm(),
    });
  }

  closeDialog(room?: Room): void {
    this.dialogRef.close(room);
  }
}
