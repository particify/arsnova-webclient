import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerGridListComponent } from './answer-grid-list.component';

describe('AnswerGridListComponent', () => {
  let component: AnswerGridListComponent;
  let fixture: ComponentFixture<AnswerGridListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerGridListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerGridListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
