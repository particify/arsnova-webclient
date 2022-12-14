import { TestBed, inject } from '@angular/core/testing';

import { LanguageService } from '@arsnova/app/services/util/language.service';
import { TranslateService } from '@ngx-translate/core';
import {
  MockGlobalStorageService,
  MockTranslateService,
} from '@arsnova/testing/test-helpers';
import { GlobalStorageService } from '@arsnova/app/services/util/global-storage.service';

describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        {
          provide: TranslateService,
          useClass: MockTranslateService,
        },
        {
          provide: GlobalStorageService,
          useClass: MockGlobalStorageService,
        },
      ],
    });
  });

  it('should be created', inject(
    [LanguageService],
    (service: LanguageService) => {
      expect(service).toBeTruthy();
    }
  ));
});
