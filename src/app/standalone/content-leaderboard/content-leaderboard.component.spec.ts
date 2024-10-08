import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLeaderboardComponent } from './content-leaderboard.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeService } from '@app/core/theme/theme.service';

describe('ContentLeaderboardComponent', () => {
  let component: ContentLeaderboardComponent;
  let fixture: ComponentFixture<ContentLeaderboardComponent>;

  const themeService = jasmine.createSpyObj(ThemeService, [
    'getTextColorFromSeed',
  ]);
  themeService.getTextColorFromSeed.and.returnValue('red');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentLeaderboardComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
      ],
      providers: [
        {
          provide: ThemeService,
          useValue: themeService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
