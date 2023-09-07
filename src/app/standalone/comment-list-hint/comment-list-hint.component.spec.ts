import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListHintComponent } from './comment-list-hint.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('CommentListHintComponent', () => {
  let component: CommentListHintComponent;
  let fixture: ComponentFixture<CommentListHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListHintComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
