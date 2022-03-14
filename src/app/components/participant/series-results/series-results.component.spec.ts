import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesResultsComponent } from './series-results.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '@arsnova/theme/theme.service';
import { AuthenticationService } from '@arsnova/app/services/http/authentication.service';
import { RoutingService } from '@arsnova/app/services/util/routing.service';
import { ContentGroupService } from '@arsnova/app/services/http/content-group.service';
import { MockThemeService, JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { of } from 'rxjs';
import { UserRole } from '@arsnova/app/models/user-roles.enum';
import { ContentGroup } from '@arsnova/app/models/content-group';
import { AnswerResultType } from '@arsnova/app/models/answer-result';
import { By } from '@angular/platform-browser';
import { Content } from '@arsnova/app/models/content';
import { ContentType } from '@arsnova/app/models/content-type.enum';
import { ContentState } from '@arsnova/app/models/content-state';

class MockAuthenticationService {
  getCurrentAuthentication() {
    return of({});
  }
}

class MockRoutingService {
  getShortId() {
  }

  getRoleString(userRole: UserRole) {
  }

  navigate(url: string) {
  }
}

describe('SeriesResultsComponent', () => {
  let component: SeriesResultsComponent;
  let fixture: ComponentFixture<SeriesResultsComponent>;

  const resultOverview =  {
    correctAnswerCount: 0,
    scorableContentCount: 0,
    achievedScore: 0,
    maxScore: 0,
    answerResults: [
      {
        contentId: '1234',
        achievedPoints: 0,
        maxPoints: 0,
        state: AnswerResultType.UNANSWERED
      }
    ]
  }

  const mockContentGroupService = jasmine.createSpyObj(['getAnswerStats']);
  mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeriesResultsComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        })
      ],
      providers: [
        {
          provide: ThemeService,
          useClass: MockThemeService
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService
        },
        {
          provide: ContentGroupService,
          useValue: mockContentGroupService
        }
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesResultsComponent);
    component = fixture.componentInstance;
    component.group = new ContentGroup();
    component.contents = [new Content('1234', '1', '1', 'subject', 'body', [], ContentType.CHOICE, {}, new ContentState(1, new Date(), true))];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display clipart and should not display score and chart if there are no contents with correct answers', async () => {
    component.group.correctOptionsPublished = false;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.NEUTRAL
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const clipart = fixture.debugElement.query(By.css('#clipart'));
    const score = fixture.debugElement.query(By.css('#score'));
    const chart = fixture.debugElement.query(By.css('#chart'));
    expect(clipart).not.toBeNull('Clipart should not be displayed');
    expect(score).toBeNull('Score should be displayed');
    expect(chart).toBeNull('Chart should be displayed');
  });

  it('should display clipart and should not display score and chart if there are contents with correct answers but correct options are not published', async () => {
    component.group.correctOptionsPublished = false;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.NEUTRAL
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const clipart = fixture.debugElement.query(By.css('#clipart'));
    const score = fixture.debugElement.query(By.css('#score'));
    const chart = fixture.debugElement.query(By.css('#chart'));
    expect(clipart).not.toBeNull('Clipart should not be displayed');
    expect(score).toBeNull('Score should be displayed');
    expect(chart).toBeNull('Chart should be displayed');
  });

  it('should display score and chart and should not display clipart if there are contents with correct answers and correct options are published', async () => {
    component.group.correctOptionsPublished = true;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const clipart = fixture.debugElement.query(By.css('#clipart'));
    const score = fixture.debugElement.query(By.css('#score'));
    const chart = fixture.debugElement.query(By.css('#chart'));
    expect(clipart).toBeNull('Clipart should not be displayed');
    expect(score).not.toBeNull('Score should be displayed');
    expect(chart).not.toBeNull('Chart should be displayed');
  });

  it('should display score 100% if all answers are correct', async () => {
    component.group.correctOptionsPublished = true;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 10,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const score = fixture.debugElement.query(By.css('#score'));
    expect(score).not.toBeNull('Score should be displayed');
    expect(score.nativeElement.textContent).toBe('100%');
  });

  it('should display score 0% if all answers are wrong', async () => {
    component.group.correctOptionsPublished = true;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const score = fixture.debugElement.query(By.css('#score'));
    expect(score).not.toBeNull('Score should be displayed');
    expect(score.nativeElement.textContent).toBe('0%');
  });

  it('should display rounded score 67% if 2 of 3 answers are correct', async () => {
    component.group.correctOptionsPublished = true;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 20,
      maxScore: 30,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT
        },
        {
          contentId: '2345',
          achievedPoints: 10,
          maxPoints: 10,
          state: AnswerResultType.CORRECT
        },
        {
          contentId: '3456',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.WRONG
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    const score = fixture.debugElement.query(By.css('#score'));
    expect(score).not.toBeNull('Score should be displayed');
    expect(score.nativeElement.textContent).toBe('67%');
  });

  it('should display full content body if there is nothing rendered specially', async () => {
    component.contents[0].body = 'Test';
    component.contents[0].renderedBody = '<p>Test</p>';
    fixture.detectChanges();
    expect(component.contentsWithResults[0].body).toBe(component.contents[0].body);
  });

  it('should display message if body is rendered specially', async () => {
    component.contents[0].body = '![alt](https://particify.de/4cbbab6358d4d02282f53f815816232e.svg)';
    component.contents[0].renderedBody = '<p><img src=\"https://particify.de/4cbbab6358d4d02282f53f815816232e.svg\" alt=\"alt\"></p>\n'; 
    fixture.detectChanges();
    expect(component.contentsWithResults[0].body).not.toBe(component.contents[0].body);
  });

  it('should not finish content loading if last content result is not received yet', async () => {
    component.hasAnsweredLastContent = true;
    const resultOverview =  {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 10,
      maxScore: 10,
      answerResults: [
        {
          contentId: '1234',
          achievedPoints: 0,
          maxPoints: 10,
          state: AnswerResultType.UNANSWERED
        }
      ]
    };
    mockContentGroupService.getAnswerStats.and.returnValue(of(resultOverview));
    fixture.detectChanges();
    expect(component.isLoadingLastContent).toBe(true);
  });
});
