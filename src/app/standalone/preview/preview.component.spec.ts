import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreviewComponent } from './preview.component';
import { NO_ERRORS_SCHEMA, Injectable } from '@angular/core';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { LikertScaleService } from '@app/core/services/util/likert-scale.service';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { ExtensionPointModule } from '@projects/extension-point/src/public-api';
import { FeatureFlagService } from '@app/core/services/util/feature-flag.service';
import { MockFeatureFlagService } from '@testing/test-helpers';
import { of } from 'rxjs';

@Injectable()
class MockContentAnswerService {}

@Injectable()
class MockLikertScaleService {}

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  const mockFormattingService = jasmine.createSpyObj(['postString']);
  mockFormattingService.postString.and.returnValue(of('rendered'));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: LikertScaleService,
          useClass: MockLikertScaleService,
        },
        {
          provide: FormattingService,
          useValue: mockFormattingService,
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService,
        },
      ],
      imports: [PreviewComponent, getTranslocoModule(), ExtensionPointModule],
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
        component.isLoading = false;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
