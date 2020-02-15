import { Component, Input } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { animate, state, style, transition, trigger } from '@angular/animations';

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

  moveHeaderRight() {
    if (this.headerPos > 0 && this.nextIndex < this.listLength - 3) {
      if (((Math.abs(this.nextIndex - this.selectedIndex) > 1 && (this.selectedIndex < this.listLength - 2)) ||
        ((this.selectedIndex >= this.listLength - 3) && (this.nextIndex === this.listLength - 5))) && (this.headerPos > 1)) {
        this.headerPos -= 2;
      } else {
        this.headerPos--;
      }
      this.headerAnimationState = 'right';
    }
  }

  moveHeaderLeft() {
    if (this.headerPos  < this.listLength - 5 && this.nextIndex > 2) {
      if (((Math.abs(this.nextIndex - this.selectedIndex) > 1 && (this.selectedIndex > 1)) ||
        (this.selectedIndex <= 1 && (this.nextIndex === 4))) && (this.headerPos < this.listLength - 6)) {
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
        this.moveHeaderLeft();
        break;
      case 'prev':
        this.containerAnimationState = 'prev-2';
        return;
      case 'prev-2':
        this.containerAnimationState = 'current';
        this.moveHeaderRight();
        break;
    }
    this.selectedIndex = this.nextIndex;
  }
}
