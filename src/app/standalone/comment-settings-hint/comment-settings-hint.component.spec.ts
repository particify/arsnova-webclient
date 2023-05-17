import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentSettingsHintComponent } from './comment-settings-hint.component';

describe('CommentSettingsHintComponent', () => {
  let component: CommentSettingsHintComponent;
  let fixture: ComponentFixture<CommentSettingsHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentSettingsHintComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentSettingsHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
