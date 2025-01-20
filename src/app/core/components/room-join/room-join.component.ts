import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormErrorStateMatcher } from '@app/core/components/form-error-state-matcher/form-error-state-matcher';
import { UntypedFormControl, Validators } from '@angular/forms';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService } from '@jsverse/transloco';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { EventService } from '@app/core/services/util/event.service';
import { THINSP } from '@app/core/utils/html-entities';

@Component({
  selector: 'app-room-join',
  templateUrl: './room-join.component.html',
  styleUrls: ['./room-join.component.scss'],
  standalone: false,
})
export class RoomJoinComponent {
  @Input({ required: true }) appTitle!: string;
  @Input() focusInput = false;

  roomCodeFormControl = new UntypedFormControl('', [
    Validators.pattern(/[0-9\s]*/),
  ]);
  matcher = new FormErrorStateMatcher();

  constructor(
    private router: Router,
    public notificationService: NotificationService,
    private translateService: TranslocoService,
    public authenticationService: AuthenticationService,
    public eventService: EventService
  ) {}

  onEnter(shortId: string) {
    this.joinRoom(shortId);
  }

  joinRoom(shortId: string): void {
    shortId = shortId.replace(/[\s]/g, '');
    if (
      this.roomCodeFormControl.hasError('required') ||
      this.roomCodeFormControl.hasError('minlength')
    ) {
      return;
    }
    if (shortId.length !== 8) {
      const msg = this.translateService.translate('home-page.exactly-8');
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
  handleInput(event: Event): void {
    // `Event` is used here because `(input)` returns this type
    const inputField = event.target as HTMLInputElement;
    const rawShortId = inputField.value;
    const pos = inputField.selectionStart as number;
    const ins = (event as InputEvent).inputType?.startsWith('insert');
    const del = (event as InputEvent).inputType === 'deleteContentForward';
    const spaceOffset =
      (ins && inputField.selectionStart === 5) ||
      (del && inputField.selectionStart === 4)
        ? 1
        : 0;
    if (!rawShortId.match(/^[0-9\s]*$/)) {
      const msg = this.translateService.translate('home-page.only-numbers');
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
    const selection =
      inputField.selectionEnd &&
      inputField.selectionStart &&
      inputField.selectionEnd > inputField.selectionStart;
    if (ins && !selection && inputField.value.length >= 9) {
      event.preventDefault();
    }
  }
}
