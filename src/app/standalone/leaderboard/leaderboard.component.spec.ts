import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardComponent } from './leaderboard.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ThemeService } from '@app/core/theme/theme.service';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  const themeService = jasmine.createSpyObj(ThemeService, [
    'getTextColorFromSeed',
  ]);
  themeService.getTextColorFromSeed.and.returnValue('red');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent, getTranslocoModule()],
      providers: [
        {
          provide: ThemeService,
          useValue: themeService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
