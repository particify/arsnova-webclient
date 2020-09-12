import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Room } from '../../../models/room';
import { Router } from '@angular/router';
import { RegisterErrorStateMatcher } from '../../home/register/register.component';
import { FormControl, Validators } from '@angular/forms';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { EventService } from '../../../services/util/event.service';
import { KeyboardUtils } from '../../../utils/keyboard';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { ApiConfigService } from '../../../services/http/api-config.service';

@Component({
  selector: 'app-room-join',
  templateUrl: './room-join.component.html',
  styleUrls: ['./room-join.component.scss']
})
export class RoomJoinComponent implements OnInit, OnDestroy {
  @ViewChild('roomCode', { static: true }) roomCodeElement: ElementRef;
  @Input() inputA11yString: string;

  room: Room;
  auth: ClientAuthentication;
  isDesktop: boolean;
  demoId: string;

  roomCodeFormControl = new FormControl('', [Validators.pattern('[0-9 ]*')]);
  matcher = new RegisterErrorStateMatcher();
  destroy$ = new Subject();

  constructor(
    private router: Router,
    public notificationService: NotificationService,
    private translateService: TranslateService,
    public authenticationService: AuthenticationService,
    public eventService: EventService,
    private globalStorageService: GlobalStorageService,
    private apiConfigService: ApiConfigService
  ) {
    this.isDesktop = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE) === 'desktop';
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().pipe(takeUntil(this.destroy$))
        .subscribe(auth => this.auth = auth);
    this.apiConfigService.getApiConfig$().subscribe(config => {
      if (config.ui.demo) {
        this.demoId = config.ui.demo;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEnter(shortId: string) {
    this.joinRoom(shortId);
  }

  joinRoom(shortId: string): void {
    if (!shortId && this.demoId) {
      shortId = this.demoId;
    }
    shortId = shortId.replace(/[\s]/g, '');
    if (this.roomCodeFormControl.hasError('required') || this.roomCodeFormControl.hasError('minlength')) {
      return;
    }
    if (shortId.length !== 8) {
      this.translateService.get('home-page.exactly-8').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      return;
    }
    if (this.roomCodeFormControl.hasError('pattern')) {
      this.translateService.get('home-page.only-numbers').subscribe(message => {
        this.notificationService.showAdvanced(message, AdvancedSnackBarTypes.WARNING);
      });
      return;
    }

    this.navigate(shortId);
  }

  navigate(shortId: string) {
    this.router.navigate([`/participant/room/${shortId}`]);
  }

  /**
   * Prettifies the room code input element which:
   *
   * - casts a 'xxxx xxxx' layout to the input field
   */
  prettifyRoomCode(keyboardEvent: KeyboardEvent): void {
    const roomCode: string = this.roomCodeElement.nativeElement.value;
    const isBackspaceKeyboardEvent: boolean = KeyboardUtils.isKeyEvent(keyboardEvent, KeyboardKey.Backspace);
    const selectedText = window.getSelection();
    const isSelected: boolean = roomCode === selectedText.toString();

    if (!isSelected) {
      // allow only backspace key press after all 8 digits were entered by the user
      if (roomCode.length - (roomCode.split(' ').length - 1) === 8 && isBackspaceKeyboardEvent === false) {
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
      } else if (roomCode.length === 4 && isBackspaceKeyboardEvent === false) { // add a space between each 4 digit group
        this.roomCodeElement.nativeElement.value += ' ';
      }
    }
  }
}
