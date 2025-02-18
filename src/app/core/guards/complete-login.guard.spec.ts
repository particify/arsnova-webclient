import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { completeLoginGuard } from './complete-login.guard';

describe('completeLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => completeLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
