import { TestBed } from '@angular/core/testing';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  LeaderboardEntry,
  LeaderboardPage,
  QuestionnaireLeaderboardByQuestionnaireIdGql,
  QuestionnaireLeaderboardUpdatedGql,
} from '@gql/generated/graphql';
import { Subject } from 'rxjs';
import {
  LEADERBOARD_DISPLAY_LIMIT,
  LeaderboardService,
  watchLeaderboard,
} from './leaderboard.service';

function entry(
  position: number,
  score: number,
  aliasId?: string,
  seed = position
): LeaderboardEntry {
  return {
    position,
    score,
    userAlias: aliasId
      ? { id: aliasId, alias: `Alias ${aliasId}`, seed }
      : null,
  };
}

function page(
  entries: LeaderboardEntry[],
  ownEntry?: LeaderboardEntry
): LeaderboardPage {
  return { entries, ownEntry, totalCount: entries.length };
}

describe('watchLeaderboard', () => {
  let initial$: Subject<unknown>;
  let updates$: Subject<unknown>;
  let byQuestionnaireId: jasmine.SpyObj<QuestionnaireLeaderboardByQuestionnaireIdGql>;
  let updated: jasmine.SpyObj<QuestionnaireLeaderboardUpdatedGql>;
  let pages: LeaderboardPage[];

  const variables = { questionnaireId: 'q-1', contentId: 'c-1', limit: 10 };

  beforeEach(() => {
    initial$ = new Subject();
    updates$ = new Subject();
    byQuestionnaireId = jasmine.createSpyObj('ByQuestionnaireIdGql', ['watch']);
    byQuestionnaireId.watch.and.returnValue({
      valueChanges: initial$,
    } as never);
    updated = jasmine.createSpyObj('UpdatedGql', ['subscribe']);
    updated.subscribe.and.returnValue(updates$ as never);
    pages = [];
    watchLeaderboard(byQuestionnaireId, updated, variables).subscribe((p) =>
      pages.push(p)
    );
  });

  function emitInitial(p: LeaderboardPage | null, dataState = 'complete') {
    initial$.next({
      dataState,
      data: { questionnaireLeaderboardByQuestionnaireId: p },
    });
  }

  function emitUpdate(p: LeaderboardPage | null) {
    updates$.next({ data: { questionnaireLeaderboardUpdated: p } });
  }

  it('queries and subscribes with the same variables', () => {
    expect(byQuestionnaireId.watch).toHaveBeenCalledOnceWith({ variables });
    expect(updated.subscribe).toHaveBeenCalledOnceWith({ variables });
  });

  it('starts with the current state, skipping incomplete data', () => {
    const current = page([entry(1, 300, 'a')]);
    emitInitial(null, 'partial');
    emitInitial(current);
    expect(pages).toEqual([current]);
  });

  it('continues with pushed updates and ignores the query from then on', () => {
    const pushed = page([entry(1, 500, 'b')]);
    emitInitial(page([entry(1, 300, 'a')]));
    emitUpdate(pushed);
    emitInitial(page([entry(1, 100, 'c')]));
    expect(pages.length).toBe(2);
    expect(pages[1]).toEqual(pushed);
  });

  it('turns a missing page into an empty one', () => {
    emitInitial(null);
    expect(pages).toEqual([{ entries: [], totalCount: 0 }]);
  });
});

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getTextColorFromSeed',
    ]);
    themeService.getTextColorFromSeed.and.callFake(
      (seed?: number) => `color-${seed ?? 'none'}`
    );
    TestBed.configureTestingModule({
      providers: [{ provide: ThemeService, useValue: themeService }],
    });
    service = TestBed.inject(LeaderboardService);
  });

  describe('getOwnEntry', () => {
    it('prefers the entry the server reports separately', () => {
      const own = entry(42, 10, 'me');
      expect(service.getOwnEntry(page([entry(1, 300, 'me')], own), 'me')).toBe(
        own
      );
    });

    it('finds the entry by alias within the page', () => {
      const mine = entry(2, 200, 'me');
      expect(service.getOwnEntry(page([entry(1, 300, 'a'), mine]), 'me')).toBe(
        mine
      );
    });

    it('finds nothing without an alias', () => {
      expect(
        service.getOwnEntry(page([entry(1, 300, 'a')]), null)
      ).toBeUndefined();
    });
  });

  describe('buildLeaderboardTableData', () => {
    const entries = Array.from({ length: 12 }, (_, i) =>
      entry(i + 1, 1200 - i * 100, `a-${i}`)
    );

    it('maps an entry to a row coloured by its alias', () => {
      expect(service.buildLeaderboardTableData(page([entries[0]]))).toEqual([
        {
          position: 1,
          userAlias: entries[0].userAlias,
          score: 1200,
          color: 'color-1',
        },
      ]);
    });

    it('greys out a participant without an alias', () => {
      const [row] = service.buildLeaderboardTableData(page([entry(1, 50)]));
      expect(row.userAlias).toBeNull();
      expect(row.color).toBe('color-none');
    });

    it('shows the top rows and appends the own entry below the cut', () => {
      const own = entry(57, 3, 'me');
      const rows = service.buildLeaderboardTableData(page(entries, own));
      expect(rows.length).toBe(LEADERBOARD_DISPLAY_LIMIT + 1);
      expect(rows.slice(0, -1).map((row) => row.position)).toEqual(
        entries.slice(0, LEADERBOARD_DISPLAY_LIMIT).map((e) => e.position)
      );
      expect(rows[rows.length - 1].position).toBe(57);
    });

    it('shows every entry when asked to', () => {
      const rows = service.buildLeaderboardTableData(
        page(entries, entry(57, 3, 'me')),
        true
      );
      expect(rows.map((row) => row.position)).toEqual(
        entries.map((e) => e.position)
      );
    });
  });

  describe('buildContentLeaderboardTableData', () => {
    it('adds the result for the current content', () => {
      const [row] = service.buildContentLeaderboardTableData(
        page([
          {
            ...entry(1, 300, 'a'),
            currentResult: { points: 120, durationMs: 4200, correct: true },
          },
        ])
      );
      expect(row).toEqual(
        jasmine.objectContaining({
          position: 1,
          score: 300,
          currentPoints: 120,
          currentDuration: 4200,
          correct: true,
        })
      );
    });

    it('treats a missing result as no points', () => {
      const [row] = service.buildContentLeaderboardTableData(
        page([entry(1, 300, 'a')])
      );
      expect(row.currentPoints).toBe(0);
      expect(row.currentDuration).toBe(0);
      expect(row.correct).toBeFalse();
    });

    it('appends the own entry below the cut', () => {
      const entries = Array.from({ length: 11 }, (_, i) =>
        entry(i + 1, 100 - i, `a-${i}`)
      );
      const rows = service.buildContentLeaderboardTableData(
        page(entries, entry(30, 1, 'me'))
      );
      expect(rows.length).toBe(LEADERBOARD_DISPLAY_LIMIT + 1);
      expect(rows[rows.length - 1].userAlias?.id).toBe('me');
    });
  });
});
