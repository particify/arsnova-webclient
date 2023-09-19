import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreviewComponent } from './preview.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';

@Injectable()
class MockContentAnswerService {}

@Injectable()
class MockLikertScaleService {}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PreviewComponent],
      providers: [
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService,
        },
      ],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PreviewComponent);
        component = fixture.componentInstance;
        component.content = new Content(
          '1',
          'subject',
          'body',
          [],
          ContentType.CHOICE,
          {}
        );
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
