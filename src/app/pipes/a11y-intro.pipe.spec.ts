import { TestBed } from '@angular/core/testing';

import { A11yIntroPipe } from '@arsnova/app/pipes/a11y-intro.pipe';
import { MockTranslateService } from '@arsnova/testing/test-helpers';
import { TranslateService } from '@ngx-translate/core';

describe('A11yIntroPipe', () => {
  let translateService: TranslateService;
  let pipe: A11yIntroPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
      ],
    });
    translateService = TestBed.inject(TranslateService);
    pipe = new A11yIntroPipe(translateService);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
