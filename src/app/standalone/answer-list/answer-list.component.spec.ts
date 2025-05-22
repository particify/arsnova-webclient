import { ComponentFixture } from '@angular/core/testing';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { AnswerListComponent } from './answer-list.component';
import { TextStatistic } from '@app/core/models/text-statistic';
import { configureTestModule } from '@testing/test.setup';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  beforeEach(async () => {
    const testBed = configureTestModule([
      getTranslocoModule(),
      AnswerListComponent,
    ]);
    testBed.compileComponents();
    fixture = testBed.createComponent(AnswerListComponent);
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
