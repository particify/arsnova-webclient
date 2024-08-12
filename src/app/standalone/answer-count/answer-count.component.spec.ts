import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AnswerCountComponent } from './answer-count.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AnswerCountComponent', () => {
  let component: AnswerCountComponent;
  let fixture: ComponentFixture<AnswerCountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnswerCountComponent, getTranslocoModule()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
