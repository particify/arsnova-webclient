import { Component, HostListener, Input } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { KeyboardKey } from '../../../utils/keyboard/keys';
import { KeyboardUtils } from '../../../utils/keyboard';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  animations: [
    trigger('slideContainer', [
      state('next', style({ opacity: 0, transform: 'translateX(-50%)' })),
      state('next-2', style({ opacity: 0, transform: 'translateX(50%)' })),
      state('current', style({ opacity: 1, transform: 'translateX(0)' })),
      state('prev', style({ opacity: 0, transform: 'translateX(50%)' })),
      state('prev-2', style({ opacity: 0, transform: 'translateX(-50%)' })),
      transition('current => *', animate('150ms ease-in')),
      transition('* => current', animate('150ms ease-out')),
    ]),
    trigger('slideHeader', [
      state('left', style({ transform: `translateX({{position}}%)` }),
        { params: { position: '0' } }),
      state('init', style({ transform: `translateX({{position}}%)` }),
        { params: { position: '0' } }),
      state('right', style({ transform: `translateX({{position}}%)` }),
        { params: { position: '0' } }),
      transition('* => *', animate('400ms ease-out')),
    ])
  ]
})
export class StepperComponent extends CdkStepper {

  @Input() listLength: number;
  @Input() alreadySent: Map<number, boolean>;
  headerPos = 0;
  containerAnimationState = 'current';
  headerAnimationState = 'init';
  nextIndex = 0;
  swipeXLocation?: number;
  swipeTime?: number;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (KeyboardUtils.isKeyEvent(event, KeyboardKey.LEFT) === true) {
      this.previous();
    } else if (KeyboardUtils.isKeyEvent(event, KeyboardKey.RIGHT) === true) {
      this.next();
    }
  }

  swipe(event: TouchEvent, when: string): void {
    const xPos = event.changedTouches[0].clientX;
    const time = new Date().getTime();
    if (when === 'start') {
      this.swipeXLocation = xPos;
      this.swipeTime = time;
    } else if (when === 'end') {
      const duration = time - this.swipeTime;
      if (duration < 1000 && Math.abs(this.swipeXLocation - xPos) > 30) {
        const direction = this.swipeXLocation > xPos ? 'next' : 'previous';
        if (direction === 'next') {
          this.next();
        } else {
          this.previous();
        }
      }
    }
  }

  next(): void {
    if (this.selectedIndex < this.listLength - 1) {
      this.onClick(this.selectedIndex + 1);
      setTimeout(() => {
        document.getElementById('step').focus();
      }, 300);
    }
  }

  previous(): void {
    if (this.selectedIndex > 0) {
      this.onClick(this.selectedIndex - 1);
      document.getElementById('step').focus();
    }
  }

  onClick(index: number) {
    if (index > this.selectedIndex) {
      this.containerAnimationState = 'next';
    } else if (index < this.selectedIndex) {
      this.containerAnimationState = 'prev';
    } else {
      return;
    }
    this.nextIndex = index;
  }

  headerAnimationDone() {
    this.headerAnimationState = 'init';
  }

  moveHeaderRight(clicked?: boolean) {
    if (this.headerPos > 0 && ((this.nextIndex < this.listLength - 3) || clicked)) {
      if (Math.abs(this.nextIndex - this.selectedIndex) > 1 && (Math.abs(this.headerPos - this.nextIndex) < 1)
        && (this.headerPos > 1)) {
        this.headerPos -= 2;
      } else {
        this.headerPos--;
      }
      this.headerAnimationState = 'right';
    }
  }

  moveHeaderLeft(clicked?: boolean) {
    if (this.headerPos  < this.listLength - 5 && (this.nextIndex > 2 || clicked)) {
      if ((Math.abs(this.nextIndex - this.selectedIndex) > 1) && (Math.abs(this.headerPos - this.nextIndex) > 3)
        && (this.headerPos < this.listLength - 6)) {
        this.headerPos += 2;
      } else {
        this.headerPos++;
      }
      this.headerAnimationState = 'left';
    }
  }

  containerAnimationDone() {
    switch (this.containerAnimationState) {
      case 'next':
        this.containerAnimationState = 'next-2';
        return;
      case 'next-2':
        this.containerAnimationState = 'current';
        if (this.nextIndex > this.headerPos + 2) {
          this.moveHeaderLeft();
        }
        break;
      case 'prev':
        this.containerAnimationState = 'prev-2';
        return;
      case 'prev-2':
        this.containerAnimationState = 'current';
        if (this.nextIndex < this.headerPos + 2) {
          this.moveHeaderRight();
        }
        break;
    }
    this.selectedIndex = this.nextIndex;
  }
}
