import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CdkStepper, CdkStepperModule } from '@angular/cdk/stepper';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Directionality } from '@angular/cdk/bidi';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { take } from 'rxjs';
import { CoreModule } from '@app/core/core.module';

@Component({
  standalone: true,
  imports: [CoreModule, TranslocoModule, CdkStepperModule],
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
      state('left', style({ transform: `translateX({{position}}%)` }), {
        params: { position: '0' },
      }),
      state('init', style({ transform: `translateX({{position}}%)` }), {
        params: { position: '0' },
      }),
      state('right', style({ transform: `translateX({{position}}%)` }), {
        params: { position: '0' },
      }),
      transition('* => *', animate('400ms ease-out')),
    ]),
  ],
})
export class StepperComponent extends CdkStepper implements OnInit, OnDestroy {
  @Output() newIndex = new EventEmitter<number>();
  @Input() showSteps = true;
  @Input() allowNavigation = true;
  @Input() listLength = 0;
  @Input() completed: Map<number, boolean> = new Map<number, boolean>();
  @Input() fixedWitdth = true;
  @Input() additionalStepIcon?: string;
  headerPos = 0;
  containerAnimationState = 'current';
  headerAnimationState = 'init';
  private nextIndex = 0;
  private swipeXLocation = 0;
  private swipeTime = 0;

  private hotkeyRefs: symbol[] = [];

  constructor(
    private announceService: AnnounceService,
    private hotkeyService: HotkeyService,
    private translateService: TranslocoService,
    dir: Directionality,
    changeDetectorRef: ChangeDetectorRef,
    elementRef: ElementRef<HTMLElement>
  ) {
    super(dir, changeDetectorRef, elementRef);
  }

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
    this.onClick(index);
    if (index > 2 && length > 5) {
      const diff = index < length - 3 ? 2 : 5 - (length - 1 - index);
      this.headerPos = index - diff;
      this.moveHeaderRight();
    }
  }

  setHeaderPosition(stepIndex: number) {
    if (this.listLength > 5) {
      const lastHeaderPos = this.listLength - 5;
      this.headerPos = stepIndex < lastHeaderPos ? stepIndex : lastHeaderPos;
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
      if (this.selectedIndex < this.listLength - 1) {
        if (this.selectedIndex < this.listLength - 1) {
          this.onClick(this.selectedIndex + 1);
          setTimeout(() => {
            document.getElementById('step')?.focus();
          }, 300);
        } else {
          this.announceService.announce('statistic.a11y-no-more-questions');
        }
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
      this.containerAnimationState = 'next';
    } else if (index < this.selectedIndex) {
      this.containerAnimationState = 'prev';
    } else {
      return;
    }
    this.nextIndex = index;
    this.sendNewIndex(this.nextIndex);
  }

  sendNewIndex(index: number) {
    this.newIndex.emit(index);
  }

  headerAnimationDone() {
    setTimeout(() => {
      this.headerAnimationState = 'init';
    });
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
      this.headerAnimationState = 'right';
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
      this.headerAnimationState = 'left';
    }
  }

  containerAnimationDone() {
    setTimeout(() => {
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
    });
  }
}
