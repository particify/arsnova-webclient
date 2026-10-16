import { ApplicationRef } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { CountdownTimerComponent } from './countdown-timer.component';

const TIME_IS_UP = 'timer.time-is-up';

declare const Zone: { current: { get(key: string): unknown } };

describe('CountdownTimerComponent', () => {
  beforeEach(() => {
    configureTestModule([
      CountdownTimerComponent,
      getTranslocoModule(),
    ]).compileComponents();
  });

  function createComponent(endDate: Date, duration = 60) {
    const fixture = TestBed.createComponent(CountdownTimerComponent);
    fixture.componentRef.setInput('endDate', endDate);
    fixture.componentRef.setInput('duration', duration);
    TestBed.inject(ApplicationRef).attachView(fixture.componentRef.hostView);
    render(fixture);
    return fixture;
  }

  // `fixture.detectChanges()` alone never runs `afterRenderEffect`/`afterRender`
  // hooks - only `ApplicationRef.tick()` does, and only for attached views.
  function render(fixture: ComponentFixture<CountdownTimerComponent>): void {
    fixture.detectChanges();
    try {
      TestBed.inject(ApplicationRef).tick();
    } catch {
      tick(0);
    }
  }

  function renderedTime(fixture: ComponentFixture<CountdownTimerComponent>) {
    return fixture.nativeElement.textContent.trim();
  }

  function progressBarElement(
    fixture: ComponentFixture<CountdownTimerComponent>
  ): HTMLElement | null {
    return fixture.nativeElement.querySelector('.progress');
  }

  // fakeAsync does not complain about a periodic timer left running, so the
  // fake zone is asked directly.
  function pendingIntervals(): number {
    const zoneSpec = Zone.current.get('FakeAsyncTestZoneSpec') as {
      pendingPeriodicTimers: unknown[];
    };
    return zoneSpec.pendingPeriodicTimers.length;
  }

  function spyOnFinished(fixture: ComponentFixture<CountdownTimerComponent>) {
    const spy = jasmine.createSpy('finished');
    fixture.componentInstance.finished.subscribe(spy);
    return spy;
  }

  it('renders the remaining time and counts it down', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() + 65000));

    expect(renderedTime(fixture)).toBe('01:05');

    tick(2000);
    fixture.detectChanges();

    expect(renderedTime(fixture)).toBe('01:03');

    discardPeriodicTasks();
  }));

  it('emits finished exactly once when the countdown reaches zero', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() + 3000), 3);
    const finished = spyOnFinished(fixture);

    tick(10000);
    fixture.detectChanges();

    expect(finished).toHaveBeenCalledTimes(1);
    expect(renderedTime(fixture)).toBe(TIME_IS_UP);

    discardPeriodicTasks();
  }));

  it('stops its interval once the countdown has finished', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() + 3000), 3);
    const finished = spyOnFinished(fixture);

    tick(10000);
    fixture.detectChanges();

    expect(finished).toHaveBeenCalledTimes(1);
    expect(pendingIntervals()).toBe(0);
  }));

  it('starts no interval for an end date in the past', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() - 60000));

    tick(2000);
    fixture.detectChanges();

    expect(renderedTime(fixture)).toBe('');
    expect(pendingIntervals()).toBe(0);
  }));

  it('counts down again when a finished timer gets a future end date', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() + 2000), 2);
    const finished = spyOnFinished(fixture);
    tick(5000);
    fixture.detectChanges();
    expect(finished).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('endDate', new Date(Date.now() + 65000));
    fixture.componentRef.setInput('duration', 65);
    render(fixture);
    expect(renderedTime(fixture)).toBe('01:05');

    tick(2000);
    fixture.detectChanges();

    expect(renderedTime(fixture)).toBe('01:03');

    discardPeriodicTasks();
  }));

  it('does not emit finished when it is destroyed before the countdown ends', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() + 60000));
    const finished = spyOnFinished(fixture);

    tick(2000);
    fixture.destroy();
    tick(60000);

    expect(finished).not.toHaveBeenCalled();
  }));

  it('does not mutate the end date it is given', fakeAsync(() => {
    const endDate = new Date(Date.now() + 60000);
    const time = endDate.getTime();

    createComponent(endDate);
    tick(2000);

    expect(endDate.getTime()).toBe(time);

    discardPeriodicTasks();
  }));

  it('renders nothing for an end date in the past', fakeAsync(() => {
    const fixture = createComponent(new Date(Date.now() - 60000));

    expect(renderedTime(fixture)).toBe('');
    expect(progressBarElement(fixture)).toBeNull();

    tick(2000);
    fixture.detectChanges();

    expect(renderedTime(fixture)).toBe('');
    expect(progressBarElement(fixture)).toBeNull();

    discardPeriodicTasks();
  }));

  describe('progress bar animation', () => {
    it('creates an animation for the initial countdown with the expected duration', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 45000), 45);

      const bar = progressBarElement(fixture)!;
      const [animation] = bar.getAnimations();

      expect(animation).toBeDefined();
      expect(animation.effect?.getTiming().duration).toBe(45000);

      discardPeriodicTasks();
    }));

    it('renders a partially filled bar when the remaining time is less than the full duration', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 30000), 60);

      const bar = progressBarElement(fixture)!;

      expect(bar.style.width).toBe('50%');

      discardPeriodicTasks();
    }));

    it('restarts the animation on the same element when reused for a new countdown', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 60000), 60);
      tick(5000);
      render(fixture);

      const bar = progressBarElement(fixture)!;
      const [firstAnimation] = bar.getAnimations();
      expect(firstAnimation).toBeDefined();

      fixture.componentRef.setInput('endDate', new Date(Date.now() + 30000));
      fixture.componentRef.setInput('duration', 30);
      render(fixture);

      const sameBar = progressBarElement(fixture)!;
      expect(sameBar).toBe(bar);

      const [secondAnimation] = sameBar.getAnimations();
      expect(secondAnimation).toBeDefined();
      expect(secondAnimation).not.toBe(firstAnimation);
      expect(secondAnimation.effect?.getTiming().duration).toBe(30000);
      expect(secondAnimation.currentTime).toBe(0);
      expect(firstAnimation.playState).toBe('idle');

      discardPeriodicTasks();
    }));

    it('restarts the animation even when the resumed remaining time is unchanged', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 30250), 30);

      const bar = progressBarElement(fixture)!;
      const [firstAnimation] = bar.getAnimations();
      expect(firstAnimation).toBeDefined();

      tick(5000);
      fixture.componentRef.setInput('endDate', new Date(Date.now() + 30250));
      render(fixture);

      const [secondAnimation] = bar.getAnimations();
      expect(secondAnimation).toBeDefined();
      expect(secondAnimation).not.toBe(firstAnimation);
      expect(firstAnimation.playState).toBe('idle');

      discardPeriodicTasks();
    }));

    it('cancels the running animation when the component is destroyed', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 60000));

      const bar = progressBarElement(fixture)!;
      const [animation] = bar.getAnimations();
      expect(animation).toBeDefined();

      fixture.destroy();

      expect(animation.playState).toBe('idle');
    }));

    it('renders no progress bar when showProgressBar is false', fakeAsync(() => {
      const fixture = createComponent(new Date(Date.now() + 60000));

      fixture.componentRef.setInput('showProgressBar', false);
      render(fixture);

      expect(progressBarElement(fixture)).toBeNull();

      discardPeriodicTasks();
    }));
  });
});
