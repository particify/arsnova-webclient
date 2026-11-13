import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LiveFeedbackType } from '@app/core/models/live-feedback-type.enum';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { RoomService } from '@app/core/services/http/room.service';
import { HotkeyService } from '@app/core/services/util/hotkey.service';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { FocusModeService } from '@app/creator/_services/focus-mode.service';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { ContentPresentationState } from '@app/core/models/events/content-presentation-state';
import {
  ContentDetailsFragment,
  ContentType,
  PublishedQuestionnairesByRoomIdGql,
  QnaStateChangedGql,
  QuestionnairesByRoomIdGql,
  QuestionnairesChangedGql,
  QuestionnaireSummaryFragment,
  QuestionnaireType,
  RoomStatsByIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BehaviorSubject, NEVER, map, of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { KeyButtonBarComponent } from '@app/presentation/bars/key-button-bar/key-button-bar.component';
import { ContentPresentationMenuComponent } from '@app/standalone/content-presentation-menu/content-presentation-menu.component';
import { ControlBarComponent } from './control-bar.component';

describe('ControlBarComponent', () => {
  let fixture: ComponentFixture<ControlBarComponent>;
  let hotkeyService: jasmine.SpyObj<HotkeyService>;
  let contentResultsService: ContentResultsService;
  // The listed questionnaires, as the cache hands them out after each change.
  let questionnaires$: BehaviorSubject<QuestionnaireSummaryFragment[]>;
  // Only specs about what the bar shows need its real template.
  let renderTemplate = false;

  const quiz = {
    id: 'q-1',
    name: 'Quiz',
    type: QuestionnaireType.Quiz,
    leaderboardEnabled: true,
  } as QuestionnaireSummaryFragment;

  function questionnairesQuery(field: string) {
    const gql = jasmine.createSpyObj(field, ['watch']);
    gql.watch.and.returnValue({
      valueChanges: questionnaires$.pipe(
        map((questionnaires) => ({
          loading: false,
          data: { [field]: questionnaires },
        }))
      ),
      refetch: () => Promise.resolve({}),
    });
    return gql;
  }

  function subscriptionGql(name: string) {
    const gql = jasmine.createSpyObj(name, ['subscribe']);
    gql.subscribe.and.returnValue(NEVER);
    return gql;
  }

  beforeEach(() => {
    // The bar's own template is irrelevant to the initialisation under test.
    if (!renderTemplate) {
      TestBed.overrideComponent(ControlBarComponent, { set: { template: '' } });
    }
    const roomStatsById = jasmine.createSpyObj('RoomStatsByIdGql', ['watch']);
    roomStatsById.watch.and.returnValue({
      valueChanges: of({ data: { roomById: { stats: {} } } }),
    });
    const focusModeService = jasmine.createSpyObj('FocusModeService', [
      'getState',
      'getFocusModeEnabled',
    ]);
    focusModeService.getState.and.returnValue(NEVER);
    focusModeService.getFocusModeEnabled.and.returnValue(of(false));
    const presentationService = jasmine.createSpyObj('PresentationService', [
      'getCommentState',
      'getCommentZoomChanges',
      'getContentState',
      'getFeedbackStarted',
      'getLeaderboardDisplayed',
    ]);
    for (const method of Object.keys(presentationService)) {
      presentationService[method].and.returnValue(NEVER);
    }
    questionnaires$ = new BehaviorSubject([quiz]);

    configureTestModule(
      [
        getTranslocoModule(),
        RouterTestingModule.withRoutes([]),
        ControlBarComponent,
      ],
      [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
        {
          provide: QuestionnairesByRoomIdGql,
          useValue: questionnairesQuery('questionnairesByRoomId'),
        },
        {
          provide: PublishedQuestionnairesByRoomIdGql,
          useValue: questionnairesQuery('publishedQuestionnairesByRoomId'),
        },
        {
          provide: QuestionnairesChangedGql,
          useValue: subscriptionGql('QuestionnairesChangedGql'),
        },
        {
          provide: QnaStateChangedGql,
          useValue: subscriptionGql('QnaStateChangedGql'),
        },
        { provide: RoomStatsByIdGql, useValue: roomStatsById },
        { provide: PresentationService, useValue: presentationService },
        { provide: RoomSettingsService, useValue: {} },
        { provide: RoomService, useValue: {} },
      ]
    );
    TestBed.overrideProvider(FocusModeService, { useValue: focusModeService });
    hotkeyService = TestBed.inject(
      HotkeyService
    ) as jasmine.SpyObj<HotkeyService>;
    contentResultsService = TestBed.inject(ContentResultsService);

    fixture = TestBed.createComponent(ControlBarComponent);
    const room = new Room();
    room.id = 'room-1';
    room.shortId = '12345678';
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('room', room);
    fixture.componentRef.setInput('userRole', UserRole.OWNER);
    fixture.componentRef.setInput('viewRole', UserRole.OWNER);
    fixture.componentRef.setInput('roomSettings', {
      id: 'settings-1',
      roomId: 'room-1',
      surveyEnabled: false,
      surveyType: LiveFeedbackType.FEEDBACK,
    });
  });

  it('registers its hotkeys once, however often results visibility changes', fakeAsync(() => {
    fixture.detectChanges();
    const registrations = hotkeyService.registerHotkey.calls.count();
    expect(registrations).toBeGreaterThan(0);

    contentResultsService.setResultsVisible(true);
    fixture.detectChanges();
    contentResultsService.setResultsVisible(false);
    fixture.detectChanges();
    contentResultsService.setResultsVisible(true);
    fixture.detectChanges();
    flush();

    expect(hotkeyService.registerHotkey).toHaveBeenCalledTimes(registrations);
    fixture.destroy();
  }));

  it('removes the highlights once the results are hidden again', fakeAsync(() => {
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.evaluateContentState();
    const item = (name: string) =>
      component.groupItems.find((i) => i.name === name);
    expect(item('correct')).toBeDefined();

    contentResultsService.setResultsVisible(true);
    contentResultsService.setCorrectResultsVisible(true);
    fixture.detectChanges();
    flush();
    expect(item('results')?.highlighted).toBeTrue();
    expect(item('correct')?.highlighted).toBeTrue();

    contentResultsService.setResultsVisible(false);
    contentResultsService.setCorrectResultsVisible(false);
    fixture.detectChanges();
    flush();
    expect(item('results')?.highlighted).toBeFalse();
    expect(item('correct')?.highlighted).toBeFalse();
    fixture.destroy();
  }));

  describe('leaderboard control', () => {
    function offersLeaderboard(): boolean {
      return fixture.componentInstance.groupItems.some(
        (item) => item.name === 'leaderboard'
      );
    }

    function listQuestionnaires(leaderboardEnabled: boolean) {
      questionnaires$.next([{ ...quiz, leaderboardEnabled }]);
      fixture.detectChanges();
    }

    it('offers the leaderboard of a questionnaire that has it enabled', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      // The active questionnaire is only picked once the list has loaded.
      fixture.detectChanges();

      expect(offersLeaderboard()).toBeTrue();
      fixture.destroy();
    }));

    it('follows the leaderboard being switched off and on again', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      listQuestionnaires(false);
      expect(offersLeaderboard()).toBeFalse();

      listQuestionnaires(true);
      expect(offersLeaderboard()).toBeTrue();
      fixture.destroy();
    }));
  });

  describe('content arrows', () => {
    const stepState = PresentationService.prototype.getStepState;
    const content = {
      id: 'c-0',
      formatData: { format: ContentType.Choice },
    } as ContentDetailsFragment;

    function arrowsDisabled() {
      return fixture.componentInstance.arrowItems.map((i) => i.disabled);
    }

    function present(
      index: number,
      stepCount: number,
      presented?: ContentDetailsFragment
    ) {
      fixture.componentInstance.evaluateContentState(
        new ContentPresentationState(
          stepState(index, stepCount),
          index,
          stepCount,
          presented
        )
      );
    }

    beforeEach(fakeAsync(() => {
      questionnaires$.next([{ ...quiz, contentCount: 1 }]);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
    }));

    afterEach(() => fixture.destroy());

    it('moves on from the only content of a series to its attributions', () => {
      present(0, 2, content);

      expect(arrowsDisabled()).toEqual([true, false]);
    });

    it('moves back from the attributions to the only content', () => {
      present(1, 2);

      expect(arrowsDisabled()).toEqual([false, true]);
    });

    it('offers no way to move from the only content of a series without attributions', () => {
      present(0, 1, content);

      expect(arrowsDisabled()).toEqual([true, true]);
    });
  });

  describe('on a step without a content', () => {
    beforeAll(() => (renderTemplate = true));
    afterAll(() => (renderTemplate = false));

    it('keeps the arrows but drops the content menu', fakeAsync(() => {
      const component = fixture.componentInstance;
      fixture.componentRef.setInput('questionnaireId', quiz.id);
      fixture.detectChanges();
      flush();
      component.updateFeature('questionnaire');
      component.evaluateContentState(
        new ContentPresentationState(
          PresentationService.prototype.getStepState(1, 2),
          1,
          2
        )
      );
      fixture.detectChanges();
      flush();

      const barItems = fixture.debugElement
        .queryAll(By.directive(KeyButtonBarComponent))
        .map((bar) => bar.componentInstance.items);
      expect(barItems).toContain(component.arrowItems);
      expect(
        fixture.debugElement.query(
          By.directive(ContentPresentationMenuComponent)
        )
      ).toBeNull();
      fixture.destroy();
    }));
  });
});
