import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '@app/core/theme/theme.service';
import { LeaderboardEntry, LeaderboardPage } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { LeaderboardComponent } from './leaderboard.component';

function entry(
  position: number,
  score: number,
  aliasId?: string
): LeaderboardEntry {
  return {
    position,
    score,
    userAlias: aliasId
      ? { id: aliasId, alias: `Alias ${aliasId}`, seed: position }
      : null,
  };
}

describe('LeaderboardComponent', () => {
  let fixture: ComponentFixture<LeaderboardComponent>;

  function setUp(entries: LeaderboardEntry[], aliasId?: string) {
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getTextColorFromSeed',
    ]);
    themeService.getTextColorFromSeed.and.returnValue('rgb(1, 2, 3)');
    configureTestModule(
      [getTranslocoModule(), LeaderboardComponent],
      [{ provide: ThemeService, useValue: themeService }]
    ).compileComponents();
    fixture = TestBed.createComponent(LeaderboardComponent);
    const leaderboardPage: LeaderboardPage = {
      entries,
      totalCount: entries.length,
    };
    fixture.componentRef.setInput('leaderboardPage', leaderboardPage);
    fixture.componentRef.setInput('aliasId', aliasId);
    fixture.detectChanges();
  }

  function cells(column: string): HTMLElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        `td.${column}`
      ) as NodeListOf<HTMLElement>
    );
  }

  it('shows a row per entry with its alias and score', () => {
    setUp([entry(1, 300, 'a'), entry(2, 200, 'b')]);
    expect(cells('alias').map((cell) => cell.textContent?.trim())).toEqual([
      'Alias a',
      'Alias b',
    ]);
    expect(cells('score')[0].textContent).toContain('300');
  });

  it('names a participant without an alias anonymous', () => {
    setUp([entry(1, 300)]);
    expect(cells('alias')[0].textContent?.trim()).toBe('general.anonymous');
  });

  it('states a shared position only once', () => {
    setUp([
      entry(1, 300, 'a'),
      entry(2, 200, 'b'),
      entry(2, 200, 'c'),
      entry(4, 100, 'd'),
    ]);
    const positions = cells('position').map((cell) => cell.textContent?.trim());
    expect(positions[1]).toMatch(/^2/);
    expect(positions[2]).toBe('');
    expect(positions[3]).toMatch(/^4/);
  });

  it('highlights the row of the user', () => {
    setUp([entry(1, 300, 'a'), entry(2, 200, 'me')], 'me');
    const bold = cells('alias').map((cell) =>
      cell.classList.contains('bold-text')
    );
    expect(bold).toEqual([false, true]);
  });

  it('hints at an empty leaderboard', () => {
    setUp([]);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'content.no-leaderboard-entries'
    );
  });
});
