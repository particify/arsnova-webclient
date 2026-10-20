import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeService } from '@app/core/theme/theme.service';
import { LeaderboardPage } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentLeaderboardComponent } from './content-leaderboard.component';

describe('ContentLeaderboardComponent', () => {
  let fixture: ComponentFixture<ContentLeaderboardComponent>;
  let component: ContentLeaderboardComponent;

  const leaderboardPage: LeaderboardPage = {
    entries: [
      {
        position: 1,
        score: 300,
        userAlias: { id: 'a', alias: 'Alias a', seed: 1 },
        currentResult: { points: 120, durationMs: 4200, correct: true },
      },
      {
        position: 2,
        score: 200,
        userAlias: { id: 'me', alias: 'Alias me', seed: 2 },
        currentResult: { points: 0, durationMs: 9000, correct: false },
      },
    ],
    totalCount: 2,
  };

  function setUp(contentDuration?: number) {
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getTextColorFromSeed',
    ]);
    themeService.getTextColorFromSeed.and.returnValue('rgb(1, 2, 3)');
    configureTestModule(
      [getTranslocoModule(), ContentLeaderboardComponent],
      [{ provide: ThemeService, useValue: themeService }]
    ).compileComponents();
    fixture = TestBed.createComponent(ContentLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('leaderboardPage', leaderboardPage);
    fixture.componentRef.setInput('aliasId', 'me');
    fixture.componentRef.setInput('contentDuration', contentDuration);
    fixture.detectChanges();
  }

  it('shows the current points of each participant', () => {
    setUp();
    expect(component.displayedColumns).toEqual(['position', 'name', 'score']);
    expect(component.dataSource?.data.map((row) => row.currentPoints)).toEqual([
      120, 0,
    ]);
    expect(fixture.nativeElement.textContent).toContain('(+120)');
  });

  it('adds the answer duration for a timed content, once', () => {
    setUp(30);
    fixture.componentRef.setInput('leaderboardPage', {
      ...leaderboardPage,
    });
    fixture.detectChanges();
    expect(component.displayedColumns).toEqual([
      'position',
      'name',
      'score',
      'currentDuration',
    ]);
  });

  it('highlights the row of the user', () => {
    setUp();
    const bold = Array.from(
      fixture.nativeElement.querySelectorAll(
        'td.alias'
      ) as NodeListOf<HTMLElement>
    ).map((cell) => cell.classList.contains('bold-text'));
    expect(bold).toEqual([false, true]);
  });
});
