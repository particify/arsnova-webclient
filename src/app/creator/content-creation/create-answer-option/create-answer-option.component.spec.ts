import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { CreateAnswerOptionComponent } from './create-answer-option.component';

describe('CreateAnswerOptionComponent', () => {
  let component: CreateAnswerOptionComponent;
  let fixture: ComponentFixture<CreateAnswerOptionComponent>;

  const mockResetEvent = new EventEmitter<boolean>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateAnswerOptionComponent],
      imports: [getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateAnswerOptionComponent);
    component = fixture.componentInstance;
    component.resetEvent = mockResetEvent;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
