import { TestBed, inject } from '@angular/core/testing';

import { DialogService } from './dialog.service';
import { MatDialogModule } from '@angular/material/dialog';
import { TrackingService } from './tracking.service';

class MockTrackingService {}

describe('DialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        DialogService,
        {
          provide: TrackingService,
          useClass: MockTrackingService,
        },
      ],
    });
  });

  it('should be created', inject([DialogService], (service: DialogService) => {
    expect(service).toBeTruthy();
  }));
});
