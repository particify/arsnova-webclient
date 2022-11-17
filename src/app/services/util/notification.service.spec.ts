import { TestBed, inject } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { MockRouter } from '@arsnova/testing/test-helpers';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
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
          useClass: MockRouter
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService
        }
      ]
    });
  });

  it('should be created', inject([NotificationService], (service: NotificationService) => {
    expect(service).toBeTruthy();
  }));
});
