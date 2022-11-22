import { TestBed, inject } from '@angular/core/testing';

import { DemoRoomGuard } from './demo-room.guard';
import { MockRouter } from '@arsnova/testing/test-helpers';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { DemoService } from '@arsnova/app/services/demo.service';
import { AuthenticationGuard } from '@arsnova/app/guards/authentication.guard';

@Injectable()
class MockDemoService {}

@Injectable()
class MockAuthenticationGuard {}

describe('DemoRoomGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemoRoomGuard,
        {
          provide: DemoService,
          useClass: MockDemoService
        },
        {
          provide: AuthenticationGuard,
          useClass: MockAuthenticationGuard
        },
        {
          provide: Router,
          useClass: MockRouter
        }
      ]
    });
  });

  it('should be created', inject([DemoRoomGuard], (guard: DemoRoomGuard) => {
    expect(guard).toBeTruthy();
  }));
});
