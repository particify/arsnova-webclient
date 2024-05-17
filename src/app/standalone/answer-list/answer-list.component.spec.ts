import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ActivatedRouteStub } from '@testing/test-helpers';
import { getTranslocoModule } from '@testing/transloco-testing.module';

import { AnswerListComponent } from './answer-list.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TextStatistic } from '@app/core/models/text-statistic';

describe('AnswerListComponent', () => {
  let component: AnswerListComponent;
  let fixture: ComponentFixture<AnswerListComponent>;

  const snapshot = new ActivatedRouteSnapshot();
  snapshot.data = {
    viewRole: UserRole.OWNER,
  };
  const activatedRouteStub = new ActivatedRouteStub(
    undefined,
    undefined,
    snapshot
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule(), AnswerListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
      ],
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
