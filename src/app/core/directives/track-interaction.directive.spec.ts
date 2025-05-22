import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, inject } from '@angular/core/testing';
import {
  EventCategory,
  TrackingService,
} from '@app/core/services/util/tracking.service';
import { TrackInteractionDirective } from './track-interaction.directive';
import { configureTestModule } from '@testing/test.setup';

const TEST_TRACK_INTERACTION = 'UI action performed';
const TEST_TRACK_NAME = 'test-track-name';

@Component({
  template: ` <button
    #button
    appTrackInteraction="${TEST_TRACK_INTERACTION}"
    appTrackName="${TEST_TRACK_NAME}"
    (click)="click()"
  >
    Tracked Button
  </button>`,
  imports: [TrackInteractionDirective],
})
class TestComponent {
  @ViewChild('button') button!: ElementRef<HTMLButtonElement>;

  click() {}
}

describe('TrackInteractionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    const testBed = configureTestModule([TestComponent]);
    fixture = testBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should trigger a tracking event', inject(
    [TrackingService],
    (service: TrackingService) => {
      expect(service).toBeTruthy();
      component.button.nativeElement.click();
      expect(service.addEvent).toHaveBeenCalledWith(
        EventCategory.UI_INTERACTION,
        TEST_TRACK_INTERACTION,
        TEST_TRACK_NAME
      );
    }
  ));
});
