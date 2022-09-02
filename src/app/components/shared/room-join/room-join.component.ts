import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Room } from '../../../models/room';
import { ActivatedRoute, Router } from '@angular/router';
import { FormErrorStateMatcher } from '../../home/form-error-state-matcher/form-error-state-matcher';
import { UntypedFormControl, Validators } from '@angular/forms';
import { AdvancedSnackBarTypes, NotificationService } from '../../../services/util/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { ClientAuthentication } from '../../../models/client-authentication';
import { EventService } from '../../../services/util/event.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../services/util/global-storage.service';
import { THINSP } from '../../../utils/html-entities';

@Component({
  selector: 'app-room-join',
  templateUrl: './room-join.component.html',
  styleUrls: ['./room-join.component.scss']
})
export class RoomJoinComponent implements OnInit, OnDestroy {
  @ViewChild('roomCode', { static: true }) roomCodeElement: ElementRef;
  @Input() inputA11yString: string;
  @Input() appTitle: string;

  auth: ClientAuthentication;
  isDesktop: boolean;

  roomCodeFormControl = new UntypedFormControl('', [Validators.pattern(/[0-9\s]*/)]);
  matcher = new FormErrorStateMatcher();
  destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    public notificationService: NotificationService,
    private translateService: TranslateService,
    public authenticationService: AuthenticationService,
    public eventService: EventService,
    private globalStorageService: GlobalStorageService,
    private route: ActivatedRoute
  ) {
    this.isDesktop = this.globalStorageService.getItem(STORAGE_KEYS.DEVICE_TYPE) === 'desktop';
  }

  ngOnInit() {
    this.authenticationService.getAuthenticationChanges().pipe(takeUntil(this.destroy$))
        .subscribe(auth => this.auth = auth);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEnter(shortId: string) {
    this.joinRoom(shortId);
  }

  joinRoom(shortId: string): void {
    shortId = shortId.replace(/[\s]/g, '');
    if (this.roomCodeFormControl.hasError('required') || this.roomCodeFormControl.hasError('minlength')) {
      return;
    }
    if (shortId.length !== 8) {
      const msg = this.translateService.instant('home-page.exactly-8');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
      return;
    }

    this.navigate(shortId);
  }

  navigate(shortId: string) {
    this.router.navigate(['p', shortId]);
  }

  /**
   * Sanitizes the room code input element which. All non-numeric chars are
   * removed. Furthermore, a space is inserted after a block of 4 digits.
   */
  handleInput(event: InputEvent): void {
    const inputField = event.target as HTMLInputElement;
    const rawShortId = inputField.value;
    const pos = inputField.selectionStart;
    const ins = event.inputType?.startsWith('insert');
    const del = event.inputType === 'deleteContentForward';
    const spaceOffset = (ins && inputField.selectionStart === 5)
        || (del && inputField.selectionStart === 4) ? 1 : 0;
    if (!rawShortId.match(/^[0-9\s]*$/)) {
      const msg = this.translateService.instant('home-page.only-numbers');
      this.notificationService.showAdvanced(msg, AdvancedSnackBarTypes.WARNING);
    }
    const shortId = rawShortId
        .replace(/[^0-9]/g, '')
        .replace(/^([0-9]{4})([0-9]{1,4}).*$/, '$1' + THINSP + '$2');
    inputField.value = shortId;
    inputField.selectionStart = pos + spaceOffset;
    inputField.selectionEnd = inputField.selectionStart;
  }

  enforceLengthLimit(event: InputEvent): void {
    const inputField = event.target as HTMLInputElement;
    const ins = event.inputType.startsWith('insert');
    const selection = inputField.selectionEnd > inputField.selectionStart;
    if (ins && !selection && inputField.value.length >= 9) {
      event.preventDefault();
    }
  }
}
