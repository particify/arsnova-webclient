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

class MockContentGroupService {
  getAnswerStats() {
    const results = {
      correctAnswerCount: 0,
      scorableContentCount: 0,
      achievedScore: 0,
      maxScore: 0,
      answerResults: [
        {
          contentId: '',
          achievedPoints: 0,
          maxPoints: 0,
          state: AnswerResultType.UNANSWERED
        }
      ]
    }
    return of(results);
  }
}

describe('SeriesResultsComponent', () => {
  let component: SeriesResultsComponent;
  let fixture: ComponentFixture<SeriesResultsComponent>;

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
          useClass: MockContentGroupService
        }
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeriesResultsComponent);
    component = fixture.componentInstance;
    component.group = new ContentGroup();
    component.contents = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
