import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { MAX_LEADERBOARD_LIMIT } from '@app/core/services/util/leaderboard.service';
import {
  LeaderboardPage,
  Questionnaire,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NEVER, of } from 'rxjs';
import { ContentGroupLeaderboardComponent } from './content-group-leaderboard.component';

describe('ContentGroupLeaderboardComponent', () => {
  let fixture: ComponentFixture<ContentGroupLeaderboardComponent>;
  let component: ContentGroupLeaderboardComponent;
  let byQuestionnaireId: jasmine.SpyObj<QuestionnaireLeaderboardByQuestionnaireIdGql>;
  let announceService: jasmine.SpyObj<AnnounceService>;

  const leaderboardPage: LeaderboardPage = {
    entries: [{ position: 1, score: 300, userAlias: null }],
    totalCount: 1,
  };

  function setUp(showAll: boolean) {
    byQuestionnaireId = jasmine.createSpyObj('ByQuestionnaireIdGql', ['watch']);
    byQuestionnaireId.watch.and.returnValue({
      valueChanges: of({
        dataState: 'complete',
        data: { questionnaireLeaderboardByQuestionnaireId: leaderboardPage },
      }),
    } as never);
    const updated = jasmine.createSpyObj('UpdatedGql', ['subscribe']);
    updated.subscribe.and.returnValue(NEVER);
    announceService = jasmine.createSpyObj('AnnounceService', ['announce']);
    TestBed.overrideComponent(ContentGroupLeaderboardComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), ContentGroupLeaderboardComponent],
      [
        {
          provide: QuestionnaireLeaderboardByQuestionnaireIdGql,
          useValue: byQuestionnaireId,
        },
        { provide: QuestionnaireLeaderboardUpdatedGql, useValue: updated },
        { provide: AnnounceService, useValue: announceService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentGroupLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaire', {
      id: 'q-1',
    } as Questionnaire);
    fixture.componentRef.setInput('showAll', showAll);
    fixture.detectChanges();
  }

  it('leaves the page size to the server for the top rows', () => {
    setUp(false);
    expect(byQuestionnaireId.watch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1', limit: undefined },
    });
  });

  it('requests the whole ranking to show all of it', () => {
    setUp(true);
    expect(byQuestionnaireId.watch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1', limit: MAX_LEADERBOARD_LIMIT },
    });
  });

  it('shows the page once it has loaded', () => {
    setUp(false);
    expect(component.isLoading).toBeFalse();
    expect(component.leaderboardPage).toEqual(leaderboardPage);
  });

  it('announces the leaderboard to screen readers', () => {
    setUp(false);
    expect(announceService.announce).toHaveBeenCalledOnceWith(
      'creator.content.a11y-leaderboard-page-info'
    );
  });
});
