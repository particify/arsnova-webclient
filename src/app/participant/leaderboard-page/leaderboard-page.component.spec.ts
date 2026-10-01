import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LEADERBOARD_DISPLAY_LIMIT } from '@app/core/services/util/leaderboard.service';
import {
  Content,
  LeaderboardPage,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, Subject } from 'rxjs';
import { LeaderboardPageComponent } from './leaderboard-page.component';

describe('LeaderboardPageComponent', () => {
  let fixture: ComponentFixture<LeaderboardPageComponent>;
  let component: LeaderboardPageComponent;
  let byQuestionnaireId: jasmine.SpyObj<QuestionnaireLeaderboardByQuestionnaireIdGql>;
  let initial$: Subject<unknown>;

  beforeEach(() => {
    initial$ = new Subject();
    byQuestionnaireId = jasmine.createSpyObj('ByQuestionnaireIdGql', ['watch']);
    byQuestionnaireId.watch.and.returnValue({
      valueChanges: initial$,
    } as never);
    const updated = jasmine.createSpyObj('UpdatedGql', ['subscribe']);
    updated.subscribe.and.returnValue(NEVER);
    TestBed.overrideComponent(LeaderboardPageComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), LeaderboardPageComponent],
      [
        {
          provide: QuestionnaireLeaderboardByQuestionnaireIdGql,
          useValue: byQuestionnaireId,
        },
        { provide: QuestionnaireLeaderboardUpdatedGql, useValue: updated },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(LeaderboardPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('content', { id: 'c-1' } as Content);
    fixture.componentRef.setInput('aliasId', 'me');
    fixture.componentRef.setInput('groupId', 'q-1');
    fixture.detectChanges();
  });

  it('requests the content-scoped ranking as far as it is shown', () => {
    expect(byQuestionnaireId.watch).toHaveBeenCalledOnceWith({
      variables: {
        questionnaireId: 'q-1',
        contentId: 'c-1',
        limit: LEADERBOARD_DISPLAY_LIMIT,
      },
    });
  });

  it('keeps loading until the ranking arrives', () => {
    expect(component.isLoading).toBeTrue();
    const leaderboardPage: LeaderboardPage = { entries: [], totalCount: 0 };
    initial$.next({
      dataState: 'complete',
      data: { questionnaireLeaderboardByQuestionnaireId: leaderboardPage },
    });
    expect(component.isLoading).toBeFalse();
    expect(component.leaderboardPage).toEqual(leaderboardPage);
  });
});
