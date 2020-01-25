import { Component } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  animations: [
    trigger('slide', [
      state('left', style({ opacity: 0, transform: 'translateX(50%)' })),
      state('left-2', style({ opacity: 0, transform: 'translateX(-50%)' })),
      state('current', style({ opacity: 1, transform: 'translateX(0)' })),
      state('right', style({ opacity: 0, transform: 'translateX(-50%)' })),
      state('right-2', style({ opacity: 0, transform: 'translateX(50%)' })),
      transition('current => left', animate('150ms ease-in')),
      transition('left => left-2', animate('0s')),
      transition('current => right', animate('150ms ease-in')),
      transition('right => right-2', animate('0s')),
      transition('* => current', animate('150ms ease-out')),
    ])
  ]
})
export class StepperComponent extends CdkStepper {

  animationState = 'current';
  nextIndex: number;

  onClick(index: number): void {
    if (index > this.selectedIndex) {
      this.animationState = 'left';
    } else if (index < this.selectedIndex) {
      this.animationState = 'right';
    } else {
      return;
    }
    this.nextIndex = index;
  }

  animationDone() {
    switch (this.animationState) {
      case 'left':
        this.animationState = 'left-2';
        return;
      case 'left-2':
        this.animationState = 'current';
        break;
      case 'right':
        this.animationState = 'right-2';
        return;
      case 'right-2':
        this.animationState = 'current';
        break;
    }
    this.selectedIndex = this.nextIndex;
  }
}
