import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  EventCategory,
  TrackingService,
} from '../services/util/tracking.service';

@Directive({
  selector: '[appTrackInteraction]',
})
export class TrackInteractionDirective implements OnInit, OnDestroy {
  @Input() appTrackInteraction: string;
  @Input() appTrackCategory = EventCategory.UI_INTERACTION;
  @Input() appTrackName?: string;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.addEventListener('click', () =>
      this.trackInteraction()
    );
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('click', () =>
      this.trackInteraction()
    );
  }

  trackInteraction(): void {
    this.trackingService.addEvent(
      this.appTrackCategory,
      this.appTrackInteraction,
      this.appTrackName
    );
  }
}
