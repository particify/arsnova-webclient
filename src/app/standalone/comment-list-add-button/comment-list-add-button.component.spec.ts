import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentListAddButtonComponent } from './comment-list-add-button.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';

describe('CommentListAddButtonComponent', () => {
  let component: CommentListAddButtonComponent;
  let fixture: ComponentFixture<CommentListAddButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentListAddButtonComponent, getTranslocoModule()],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListAddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
