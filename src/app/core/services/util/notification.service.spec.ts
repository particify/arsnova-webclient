import { TestBed, inject } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MockRouter } from '@testing/test-helpers';
import { RoutingService } from '@core/services/util/routing.service';
import { Injectable } from '@angular/core';

@Injectable()
class MockRoutingService {}

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        NotificationService,
        {
          provide: Router,
          useClass: MockRouter,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
      ],
    });
  });

  it('should be created', inject(
    [NotificationService],
    (service: NotificationService) => {
      expect(service).toBeTruthy();
    }
  ));
});
