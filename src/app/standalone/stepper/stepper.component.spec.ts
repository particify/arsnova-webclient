import { CdkStepperModule } from '@angular/cdk/stepper';
import {
  Component,
  EnvironmentProviders,
  Provider,
  input,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { StepperComponent } from './stepper.component';

@Component({
  imports: [StepperComponent, CdkStepperModule],
  template: `
    <app-stepper [listLength]="length()">
      @for (step of steps(); track $index) {
        <cdk-step></cdk-step>
      }
    </app-stepper>
  `,
})
class StepperHostComponent {
  length = input(0);
  stepper = viewChild.required(StepperComponent);

  steps() {
    return Array.from({ length: this.length() });
  }
}

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperHostComponent>;

  function setUp(
    length: number,
    animations: Provider | EnvironmentProviders = provideNoopAnimations()
  ): StepperComponent {
    configureTestModule(
      [getTranslocoModule(), StepperHostComponent],
      [
        // configureTestModule only types plain providers; environment ones work too.
        animations as Provider,
        {
          provide: ContentAnswerService,
          useValue: jasmine.createSpyObj('ContentAnswerService', [
            'getAnswerResultIcon',
          ]),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(StepperHostComponent);
    fixture.componentRef.setInput('length', length);
    fixture.detectChanges();
    return fixture.componentInstance.stepper();
  }

  [
    { index: 0, headerPos: 0 },
    { index: 3, headerPos: 1 },
    { index: 9, headerPos: 5 },
  ].forEach(({ index, headerPos }) => {
    it(`centres the header on entry step ${index} of 10`, () => {
      const stepper = setUp(10);
      stepper.init(index, 10);
      expect(stepper.selectedIndex).toBe(index);
      expect(stepper.headerPos).toBe(headerPos);
    });
  });

  it('does not move the header of a list that fits into it', () => {
    const stepper = setUp(5);
    stepper.init(4, 5);
    expect(stepper.headerPos).toBe(0);
  });

  it('centres the header on the target of a forward jump', () => {
    const stepper = setUp(10);
    stepper.init(0, 10);
    stepper.setHeaderPosition(6);
    expect(stepper.headerPos).toBe(4);
  });

  /**
   * The horizontal shift the browser actually renders, as a share of the header's
   * width, once any header animation has settled.
   */
  async function renderedHeaderShift(): Promise<number> {
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 400));
    fixture.detectChanges();
    await fixture.whenStable();
    const header: HTMLElement = fixture.nativeElement.querySelector(
      '.stepper-container > div'
    );
    const matrix = new DOMMatrix(getComputedStyle(header).transform);
    return Math.round((matrix.m41 / header.offsetWidth) * 100);
  }

  [
    { name: 'no-op', animations: () => provideNoopAnimations() },
    { name: 'browser', animations: () => provideAnimations() },
    {
      name: 'async, as in the app',
      animations: () => provideAnimationsAsync(),
    },
  ].forEach(({ name, animations }) => {
    it(`moves the rendered header to the entry step (${name} animations)`, async () => {
      const stepper = setUp(10, animations());
      stepper.init(6, 10);

      expect(await renderedHeaderShift()).toBe(-80);
    });

    it(`moves the rendered header on a forward jump (${name} animations)`, async () => {
      const stepper = setUp(10, animations());
      stepper.init(0, 10);
      expect(await renderedHeaderShift()).toBe(0);

      stepper.setHeaderPosition(8);

      expect(await renderedHeaderShift()).toBe(-100);
    });
  });
});
