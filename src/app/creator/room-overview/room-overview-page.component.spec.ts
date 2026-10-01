import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Room } from '@app/core/models/room';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { DialogService } from '@app/core/services/util/dialog.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  ContentType,
  QuestionnairesByRoomIdGql,
  QuestionnairesChangedGql,
  QuestionnaireType,
  RoomByShortIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { MockRouter } from '@testing/test-helpers';
import { Subject, of } from 'rxjs';
import { RoomOverviewPageComponent } from './room-overview-page.component';

describe('RoomOverviewPageComponent (creator)', () => {
  let fixture: ComponentFixture<RoomOverviewPageComponent>;
  let component: RoomOverviewPageComponent;
  let router: MockRouter;
  let questionnairesByRoomId: jasmine.SpyObj<QuestionnairesByRoomIdGql>;
  let questionnairesChanged$: Subject<unknown>;
  let refetch: jasmine.Spy;
  let dialogService: jasmine.SpyObj<DialogService>;
  let globalStorageService: jasmine.SpyObj<GlobalStorageService>;

  function setUp(userRole = UserRole.OWNER, expandDescription = false) {
    // Covers the questionnaire handling; the feature cards have their own specs.
    TestBed.overrideComponent(RoomOverviewPageComponent, {
      set: { template: '', imports: [] },
    });
    refetch = jasmine.createSpy('refetch').and.resolveTo({});
    questionnairesByRoomId = jasmine.createSpyObj('QuestionnairesByRoomIdGql', [
      'watch',
    ]);
    questionnairesByRoomId.watch.and.returnValue({
      valueChanges: of({
        loading: false,
        data: {
          questionnairesByRoomId: [
            { id: 'q-1', name: 'Quiz', type: QuestionnaireType.Quiz },
            null,
          ],
        },
      }),
      refetch,
    } as never);
    questionnairesChanged$ = new Subject();
    const questionnairesChanged = jasmine.createSpyObj(
      'QuestionnairesChangedGql',
      ['subscribe']
    );
    questionnairesChanged.subscribe.and.returnValue(questionnairesChanged$);
    const roomByShortId = jasmine.createSpyObj('RoomByShortIdGql', ['fetch']);
    roomByShortId.fetch.and.returnValue(
      of({ data: { roomByShortId: { id: 'room-1', name: 'Room' } } })
    );
    const contentService = jasmine.createSpyObj('ContentService', [
      'getTypeIcons',
    ]);
    contentService.getTypeIcons.and.returnValue(
      new Map([
        [ContentType.Choice, 'list'],
        [ContentType.Slide, 'info'],
        [ContentType.Wordcloud, 'cloud'],
      ])
    );
    dialogService = jasmine.createSpyObj('DialogService', [
      'openQuestionnaireCreationDialog',
    ]);
    globalStorageService = jasmine.createSpyObj('GlobalStorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    globalStorageService.getItem.and.callFake((key: symbol) =>
      key === STORAGE_KEYS.EXPAND_ROOM_DESCRIPTION
        ? expandDescription
        : undefined
    );

    configureTestModule(
      [getTranslocoModule(), RoomOverviewPageComponent],
      [
        { provide: Router, useClass: MockRouter },
        {
          provide: QuestionnairesByRoomIdGql,
          useValue: questionnairesByRoomId,
        },
        { provide: QuestionnairesChangedGql, useValue: questionnairesChanged },
        { provide: RoomByShortIdGql, useValue: roomByShortId },
        { provide: ContentService, useValue: contentService },
        { provide: DialogService, useValue: dialogService },
        { provide: GlobalStorageService, useValue: globalStorageService },
        ContentGroupService,
        { provide: RoomStatsService, useValue: {} },
      ]
    ).compileComponents();

    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('room', new Room());
    fixture.componentRef.setInput('roomId', 'room-1');
    fixture.componentRef.setInput('shortId', '12345678');
    fixture.componentRef.setInput('viewRole', userRole);
    fixture.componentRef.setInput('userRole', userRole);
    fixture.detectChanges();
  }

  it('lists the questionnaires of the room', () => {
    setUp();

    expect(questionnairesByRoomId.watch).toHaveBeenCalledWith({
      variables: { roomId: 'room-1' },
    });
    expect(component.questionnaires().map((q) => q.id)).toEqual(['q-1']);
    expect(component.loadingQuestionnaires()).toBeFalse();
  });

  it('reloads the questionnaires once they have changed', () => {
    setUp();

    questionnairesChanged$.next({});

    expect(refetch).toHaveBeenCalled();
  });

  it('shows the formats each questionnaire type supports, without slides', () => {
    setUp();

    const formats = (type: QuestionnaireType) => [
      ...(component.questionnaireContentFormatIcons.get(type)?.keys() ?? []),
    ];
    expect(formats(QuestionnaireType.Quiz)).toEqual([ContentType.Choice]);
    expect(formats(QuestionnaireType.Mixed)).toEqual([
      ContentType.Choice,
      ContentType.Wordcloud,
    ]);
  });

  it('shows the formats in the order they are offered, not by icon', () => {
    setUp();
    const contentService = TestBed.inject(
      ContentService
    ) as jasmine.SpyObj<ContentService>;
    // An icon map in alphabetical order must not dictate the order shown
    contentService.getTypeIcons.and.returnValue(
      new Map([
        [ContentType.Binary, 'rule'],
        [ContentType.Choice, 'list'],
        [ContentType.Scale, 'mood'],
        [ContentType.Wordcloud, 'cloud'],
      ])
    );
    fixture = TestBed.createComponent(RoomOverviewPageComponent);
    component = fixture.componentInstance;

    expect([
      ...(component.questionnaireContentFormatIcons
        .get(QuestionnaireType.Mixed)
        ?.keys() ?? []),
    ]).toEqual([
      ContentType.Choice,
      ContentType.Scale,
      ContentType.Binary,
      ContentType.Wordcloud,
    ]);
  });

  it('opens a questionnaire after creating it', () => {
    setUp();
    dialogService.openQuestionnaireCreationDialog.and.returnValue({
      afterClosed: () => of({ id: 'q-new' }),
    } as never);

    component.openCreateQuestionnaireDialog(QuestionnaireType.Survey);

    expect(dialogService.openQuestionnaireCreationDialog).toHaveBeenCalledWith(
      'room-1',
      QuestionnaireType.Survey
    );
    expect(router.navigate).toHaveBeenCalledWith([
      'edit',
      '12345678',
      'questionnaire',
      'q-new',
    ]);
  });

  it('stays on the overview if creating a questionnaire is cancelled', () => {
    setUp();
    dialogService.openQuestionnaireCreationDialog.and.returnValue({
      afterClosed: () => of(undefined),
    } as never);

    component.openCreateQuestionnaireDialog();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('recognizes a moderator', () => {
    setUp(UserRole.MODERATOR);

    expect(component.isModerator()).toBeTrue();
  });

  it('expands the description only once when requested', () => {
    setUp(UserRole.OWNER, true);

    expect(component.expandDescription).toBeTrue();
    expect(globalStorageService.removeItem).toHaveBeenCalledWith(
      STORAGE_KEYS.EXPAND_ROOM_DESCRIPTION
    );
  });
});
