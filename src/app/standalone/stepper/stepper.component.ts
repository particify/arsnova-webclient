import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
  input,
} from '@angular/core';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentAnswerResult, AnswerResultState } from '@gql/generated/graphql';

export const STEPPER_ANIMATION_DURATION = 300;

enum STEP_ANIMATION_STATE {
  CURRENT = 'CURRENT',
  NEXT_IN = 'NEXT_IN',
  NEXT_OUT = 'NEXT_OUT',
  PREV_IN = 'PREV_IN',
  PREV_OUT = 'PREV_OUT',
}

@Component({
  imports: [CoreModule, TranslocoModule, CdkStepperModule],
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }],
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('slideContainer', [
      state(
        STEP_ANIMATION_STATE.NEXT_IN,
        style({ opacity: 0, transform: 'translateX(-50%)' })
      ),
      state(
        STEP_ANIMATION_STATE.NEXT_OUT,
        style({ opacity: 0, transform: 'translateX(50%)' })
      ),
      state(
        STEP_ANIMATION_STATE.CURRENT,
        style({ opacity: 1, transform: 'translateX(0)' })
      ),
      state(
        STEP_ANIMATION_STATE.PREV_IN,
        style({ opacity: 0, transform: 'translateX(50%)' })
      ),
      state(
        STEP_ANIMATION_STATE.PREV_OUT,
        style({ opacity: 0, transform: 'translateX(-50%)' })
      ),
      transition(
        `${STEP_ANIMATION_STATE.CURRENT} => *`,
        animate(`${STEPPER_ANIMATION_DURATION / 2}ms ease-in`)
      ),
      transition(
        `* => ${STEP_ANIMATION_STATE.CURRENT}`,
        animate(`${STEPPER_ANIMATION_DURATION / 2}ms ease-out`)
      ),
    ]),
  ],
})
export class StepperComponent extends CdkStepper implements OnInit, OnDestroy {
  private announceService = inject(AnnounceService);
  private hotkeyService = inject(HotkeyService);
  private translateService = inject(TranslocoService);
  private answerService = inject(ContentAnswerService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  answerResults = input<ContentAnswerResult[]>([]);

  @Output() newIndex = new EventEmitter<number>();
  @Input() showSteps = true;
  @Input() allowNavigation = true;
  @Input() listLength = 0;
  @Input() fixedWitdth = true;
  @Input() lockedContentsDisabled = false;
  AnsweResultState = AnswerResultState;
  headerPos = 0;
  stepAnimationState = STEP_ANIMATION_STATE.CURRENT;
  // The header is placed with a bound transform; only step-by-step moves slide it.
  slideHeader = false;
  private nextIndex = 0;
  private swipeXLocation = 0;
  private swipeTime = 0;

  private hotkeyRefs: symbol[] = [];

  ngOnInit() {
    this.translateService
      .selectTranslate('content.previous')
      .pipe(take(1))
      .subscribe((t) =>
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowLeft',
            action: () => this.previous(),
            actionTitle: t,
          },
          this.hotkeyRefs
        )
      );
    this.translateService
      .selectTranslate('content.next')
      .pipe(take(1))
      .subscribe((t) =>
        this.hotkeyService.registerHotkey(
          {
            key: 'ArrowRight',
            action: () => this.next(),
            actionTitle: t,
          },
          this.hotkeyRefs
        )
      );
  }

  ngOnDestroy() {
    this.hotkeyRefs.forEach((h) => this.hotkeyService.unregisterHotkey(h));
  }

  init(index: number, length: number) {
    if (index >= length) {
      setTimeout(() => {
        this.newIndex.emit(0);
      });
      return;
    }
    this.nextIndex = index;
    this.selectedIndex = index;
    this.moveHeaderTo(this.centeredHeaderPos(index, length), false);
  }

  setHeaderPosition(stepIndex: number) {
    this.moveHeaderTo(this.centeredHeaderPos(stepIndex, this.listLength), true);
  }

  // Both are called from outside the stepper's own events, e.g. from an effect.
  private moveHeaderTo(headerPos: number, slide: boolean) {
    this.slideHeader = slide;
    this.headerPos = headerPos;
    this.changeDetectorRef.markForCheck();
  }

  private centeredHeaderPos(index: number, length: number): number {
    if (length <= 5) {
      return 0;
    }
    return Math.min(Math.max(index - 2, 0), length - 5);
  }

  swipe(event: TouchEvent, when: string): void {
    const xPos = event.changedTouches[0].clientX;
    const time = new Date().getTime();
    if (when === 'start') {
      this.swipeXLocation = xPos;
      this.swipeTime = time;
    } else if (when === 'end') {
      const duration = time - this.swipeTime;
      if (
        duration < 1000 &&
        Math.abs(this.swipeXLocation - xPos) >
          Math.min(window.innerWidth / 3, 150)
      ) {
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
    if (this.allowNavigation) {
      if (
        this.selectedIndex < this.listLength - 1 &&
        (!this.isLocked(this.selectedIndex + 1) || !this.lockedContentsDisabled)
      ) {
        this.onClick(this.selectedIndex + 1);
        setTimeout(() => {
          document.getElementById('step')?.focus();
        }, 300);
      } else {
        this.announceService.announce('statistic.a11y-no-more-questions');
      }
    }
  }

  previous(): void {
    if (this.allowNavigation) {
      if (this.selectedIndex > 0) {
        this.onClick(this.selectedIndex - 1);
        setTimeout(() => {
          document.getElementById('step')?.focus();
        }, 300);
      }
    }
  }

  onClick(index: number) {
    if (index > this.selectedIndex) {
      this.stepAnimationState = STEP_ANIMATION_STATE.NEXT_IN;
    } else if (index < this.selectedIndex) {
      this.stepAnimationState = STEP_ANIMATION_STATE.PREV_IN;
    } else {
      return;
    }
    this.nextIndex = index;
    this.sendNewIndex(this.nextIndex);
  }

  sendNewIndex(index: number) {
    this.newIndex.emit(index);
  }

  moveHeaderRight(clicked?: boolean) {
    if (
      this.headerPos > 0 &&
      (this.nextIndex < this.listLength - 3 || clicked)
    ) {
      if (
        Math.abs(this.nextIndex - this.selectedIndex) > 1 &&
        Math.abs(this.headerPos - this.nextIndex) < 1 &&
        this.headerPos > 1
      ) {
        this.headerPos -= 2;
      } else {
        this.headerPos--;
      }
      this.slideHeader = true;
    }
  }

  moveHeaderLeft(clicked?: boolean) {
    if (
      this.headerPos < this.listLength - 5 &&
      (this.nextIndex > 2 || clicked)
    ) {
      if (
        Math.abs(this.nextIndex - this.selectedIndex) > 1 &&
        Math.abs(this.headerPos - this.nextIndex) > 3 &&
        this.headerPos < this.listLength - 6
      ) {
        this.headerPos += 2;
      } else {
        this.headerPos++;
      }
      this.slideHeader = true;
    }
  }

  stepAnimationDone() {
    switch (this.stepAnimationState) {
      case STEP_ANIMATION_STATE.NEXT_IN:
        this.stepAnimationState = STEP_ANIMATION_STATE.NEXT_OUT;
        return;
      case STEP_ANIMATION_STATE.NEXT_OUT:
        this.stepAnimationState = STEP_ANIMATION_STATE.CURRENT;
        if (this.nextIndex > this.headerPos + 2) {
          this.moveHeaderLeft();
        }
        break;
      case STEP_ANIMATION_STATE.PREV_IN:
        this.stepAnimationState = STEP_ANIMATION_STATE.PREV_OUT;
        return;
      case STEP_ANIMATION_STATE.PREV_OUT:
        this.stepAnimationState = STEP_ANIMATION_STATE.CURRENT;
        if (this.nextIndex < this.headerPos + 2) {
          this.moveHeaderRight();
        }
        break;
    }
    this.selectedIndex = this.nextIndex;
  }

  getAnswerResultIcon(index: number) {
    return this.answerService.getAnswerResultIcon(
      this.answerResults()[index].result
    );
  }

  isLocked(index: number): boolean {
    return !this.answerResults()[index];
  }
}
