import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesOverviewComponent } from './series-overview.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '@app/core/theme/theme.service';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MockThemeService, JsonTranslationLoader } from '@testing/test-helpers';
import { of } from 'rxjs';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroup } from '@app/core/models/content-group';
import { AnswerResultType } from '@app/core/models/answer-result';
import { By } from '@angular/platform-browser';
import { Content } from '@app/core/models/content';
import { ContentType } from '@app/core/models/content-type.enum';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ContentCarouselService } from '@app/core/services/util/content-carousel.service';

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of({});
  }
}

class MockRoutingService {
  getShortId() {}

  getRoleString(userRole: UserRole) {}

  navigate(url: string) {}
}

describe('SeriesOverviewComponent', () => {
  let component: SeriesOverviewComponent;
  let fixture: ComponentFixture<SeriesOverviewComponent>;

  const mockContentGroupService = jasmine.createSpyObj(['getAnswerStats']);

  const mockContentCarouselService = jasmine.createSpyObj([
    'isLastContentAnswered',
    'setLastContentAnswered',
  ]);

  mockContentCarouselService.isLastContentAnswered.and.returnValue(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeriesOverviewComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader,
          },
          isolate: true,
        }),
      ],
      providers: [
        {
          provide: ThemeService,
          useClass: MockThemeService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService,
        },
        {
          provide: ContentCarouselService,
          useValue: mockContentCarouselService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesOverviewComponent);
    component = fixture.componentInstance;
    component.group = new ContentGroup();
    const content1 = new Content(
      '1',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {}
    );
    content1.id = '1111';
    const content2 = new Content(
      '1',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {}
    );
    content2.id = '2222';
    const content3 = new Content(
      '1',
      'subject',
      'body',
      [],
      ContentType.CHOICE,
      {}
    );
    content3.id = '3333';
    component.contents = [content1, content2, content3];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display progress info chart and should not display correct info chart if there are no contents with correct answers', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.NEUTRAL,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const progressInfoChart = fixture.debugElement.query(
      By.css('#progress-info-chart')
    );
    const correctInfoChart = fixture.debugElement.query(
      By.css('#correct-info-chart')
    );
    expect(progressInfoChart).not.toBeNull(
      'Progress info chart should be displayed'
    );
    expect(correctInfoChart).toBeNull(
      'Correct info chart should not be displayed'
    );
  });

  it('should get correct progress text', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.NEUTRAL,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const progressDataText = component.getProgressDataText();
    expect(progressDataText).toBe('1 / 3');
  });

  it('should display correct info chart and if there are contents with correct answers', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();

    const correctInfoChart = fixture.debugElement.query(
      By.css('#correct-info-chart')
    );

    expect(correctInfoChart).not.toBeNull(
      'Correct info chart should be displayed'
    );
  });

  it('should get correct progress text if all unanswered', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 30,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const correctScoreText = component.score + '%';
    expect(correctScoreText).toBe('0%');
  });

  it('should get correct progress text if some contents answered', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 10,
      maxScore: 30,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const correctScoreText = component.score + '%';
    expect(correctScoreText).toBe('33%');
  });

  it('should not display any charts if there are no answerable contents', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    component.isPureInfoSeries = true;
    fixture.detectChanges();
    const progressInfoChart = fixture.debugElement.query(
      By.css('#progress-info-chart')
    );
    const correctInfoChart = fixture.debugElement.query(
      By.css('#correct-info-chart')
    );
    expect(progressInfoChart).toBeNull(
      'Progress info chart should not be displayed'
    );
    expect(correctInfoChart).toBeNull(
      'Correct info chart should not be displayed'
    );
  });

  it('should display group name as title if there are no answerable contents', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    component.isPureInfoSeries = true;
    component.group.name = 'Slide group';
    fixture.detectChanges();
    const headerText = fixture.debugElement.query(By.css('.header-text'));
    expect(headerText.nativeElement.textContent).toBe(' Slide group ');
  });

  it('should display correct title if there are answerable contents and some have been answered', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 10,
      maxScore: 30,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    component.isPureInfoSeries = false;
    fixture.detectChanges();
    const headerText = fixture.debugElement.query(By.css('.header-text'));
    expect(headerText.nativeElement.textContent).toBe(
      ' content.continue-where-you-stopped '
    );
  });

  it('should display correct title if there are answerable contents and all have been answered', () => {
    const resultOverview = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 10,
      maxScore: 30,
      answerResults: [
        {
          contentId: '1111',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT,
        },
        {
          contentId: '2222',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.WRONG,
        },
        {
          contentId: '3333',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.NEUTRAL,
        },
      ],
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    component.isPureInfoSeries = false;
    component.finished = true;
    fixture.detectChanges();
    const headerText = fixture.debugElement.query(By.css('.header-text'));
    expect(headerText.nativeElement.textContent).toBe(
      ' content.thanks-for-participation '
    );
  });
});
