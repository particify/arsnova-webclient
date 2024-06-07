import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLeaderboardComponent } from './content-leaderboard.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentLeaderboardComponent', () => {
  let component: ContentLeaderboardComponent;
  let fixture: ComponentFixture<ContentLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentLeaderboardComponent,
        getTranslocoModule(),
        BrowserAnimationsModule,
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
