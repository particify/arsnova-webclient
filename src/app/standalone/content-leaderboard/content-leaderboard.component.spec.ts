import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentLeaderboardComponent } from './content-leaderboard.component';

describe('ContentLeaderboardComponent', () => {
  let component: ContentLeaderboardComponent;
  let fixture: ComponentFixture<ContentLeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentLeaderboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
