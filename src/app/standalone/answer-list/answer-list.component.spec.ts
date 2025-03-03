import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { AnswerListComponent } from './answer-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TextStatistic } from '@app/core/models/text-statistic';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), AnswerListComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerListComponent);
    component = fixture.componentInstance;
    component.answers = [
      new TextStatistic('ABC', 3),
      new TextStatistic('GHI', 5),
      new TextStatistic('DEF', 5),
      new TextStatistic('JKL', 7),
      new TextStatistic('MNO', 2),
      new TextStatistic('PQR', 5),
    ];
    component.isModerator = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    const sortedAnswers = [
      new TextStatistic('JKL', 7),
      new TextStatistic('DEF', 5),
      new TextStatistic('GHI', 5),
      new TextStatistic('PQR', 5),
      new TextStatistic('ABC', 3),
      new TextStatistic('MNO', 2),
    ];
    expect(component.answers).toEqual(sortedAnswers);
  });
});
