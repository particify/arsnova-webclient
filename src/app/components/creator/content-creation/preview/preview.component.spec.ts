import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreviewComponent } from './preview.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { ContentAnswerService } from '@arsnova/app/services/http/content-answer.service';
import { LikertScaleService } from '@arsnova/app/services/util/likert-scale.service';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';

@Injectable()
class MockContentAnswerService {
}

@Injectable()
class MockLikertScaleService {
}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PreviewComponent
      ],
      providers: [
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService
        },
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService
        }
      ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PreviewComponent);
        component = fixture.componentInstance;
        component.content = new Content('1234', '0', '1', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), true));
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
