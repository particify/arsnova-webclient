import { TestBed } from '@angular/core/testing';
import { ServerTimeService } from './server-time.service';

describe('ServerTimeService', () => {
  let service: ServerTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the local time if there is no offset', () => {
    expect(service.determineServerTime().getTime()).toBeCloseTo(Date.now(), -1);
  });

  it('should update and calculate the correct average offset', () => {
    expect(service.averageOffset).toBe(0);
    service.updateAverageOffset(100);
    expect(service.averageOffset).toBe(100);
    service.updateAverageOffset(300);
    expect(service.averageOffset).toBe(200);
    service.updateAverageOffset(800);
    expect(service.averageOffset).toBe(400);
  });

  it('should add the offset to the local time', () => {
    const offset = 3600;
    service.updateAverageOffset(offset);
    expect(service.determineServerTime().getTime()).toBeCloseTo(
      Date.now() + offset,
      -1
    );
  });
});
