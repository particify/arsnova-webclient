import { TestBed } from '@angular/core/testing';

import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { MockTranslocoService } from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';

describe('A11yIntroPipe', () => {
  let translateService: TranslocoService;
  let pipe: A11yIntroPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
      ],
    });
    translateService = TestBed.inject(TranslocoService);
    pipe = new A11yIntroPipe(translateService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
