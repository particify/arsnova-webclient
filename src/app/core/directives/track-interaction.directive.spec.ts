import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  EventCategory,
  TrackingService,
} from '@app/core/services/util/tracking.service';
import { TrackInteractionDirective } from './track-interaction.directive';

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
})
class TestComponent {
  @ViewChild('button') button!: ElementRef<HTMLButtonElement>;

  click() {}
}

describe('TrackInteractionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  const trackingService = jasmine.createSpyObj('TrackingService', ['addEvent']);

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TrackInteractionDirective, TestComponent],
      providers: [
        {
          provide: TrackingService,
          useValue: trackingService,
        },
      ],
    }).createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should trigger a tracking event', async () => {
    component.button.nativeElement.click();
    expect(trackingService.addEvent).toHaveBeenCalledWith(
      EventCategory.UI_INTERACTION,
      TEST_TRACK_INTERACTION,
      TEST_TRACK_NAME
    );
  });
});
