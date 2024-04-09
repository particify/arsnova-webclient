import { TestBed } from '@angular/core/testing';
import { ServerTimeService } from '@app/core/services/util/server-time.service';
import { ServerTimeInterceptor } from './server-time.interceptor';

describe('ServerTimeInterceptor', () => {
  const serverTimeService = jasmine.createSpyObj('ServerTimeService', [
    'updateAverageOffset',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServerTimeInterceptor,
        { provide: ServerTimeService, useValue: serverTimeService },
      ],
    });
  });

  it('should be created', () => {
    const interceptor: ServerTimeInterceptor = TestBed.inject(
      ServerTimeInterceptor
    );
    expect(interceptor).toBeTruthy();
  });
});
