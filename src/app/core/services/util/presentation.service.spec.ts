import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PresentationService } from './presentation.service';
import { configureTestModule } from '@testing/test.setup';

describe('PresentationService', () => {
  let service: PresentationService;

  beforeEach(() => {
    configureTestModule([], [PresentationService]);
    service = TestBed.inject(PresentationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('recomputes the scale after the window has been resized', fakeAsync(() => {
    service.setUseRatioScale(false);
    service.setScaleFactor(innerWidth / 2);
    expect(service.scale()).toBe(2);

    const original = Object.getOwnPropertyDescriptor(window, 'innerWidth')!;
    Object.defineProperty(window, 'innerWidth', {
      value: innerWidth / 2,
      configurable: true,
    });
    try {
      window.dispatchEvent(new Event('resize'));
      expect(service.scale()).toBe(2);
      tick(100);

      expect(service.scale()).toBe(1);
    } finally {
      Object.defineProperty(window, 'innerWidth', original);
    }
  }));
});
