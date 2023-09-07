import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListFloatingButtonsComponent } from './comment-list-floating-buttons.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('CommentListFloatingButtonsComponent', () => {
  let component: CommentListFloatingButtonsComponent;
  let fixture: ComponentFixture<CommentListFloatingButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListFloatingButtonsComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListFloatingButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
