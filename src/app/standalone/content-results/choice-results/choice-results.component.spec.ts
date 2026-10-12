import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationService } from '@app/core/services/util/presentation.service';
import { ThemeService } from '@app/core/theme/theme.service';
import {
  ChoiceContentFormatData,
  ContentType,
  QuestionnaireChoiceRoundStatsByRoundIdGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { NEVER } from 'rxjs';
import { ChoiceResultsComponent } from './choice-results.component';

describe('ChoiceResultsComponent', () => {
  let fixture: ComponentFixture<ChoiceResultsComponent>;
  let component: ChoiceResultsComponent;

  const options = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];

  function setUp(
    formatData: Partial<ChoiceContentFormatData>,
    inputs: { hasCorrectAnswer?: boolean; showCorrect?: boolean } = {}
  ) {
    TestBed.overrideComponent(ChoiceResultsComponent, {
      set: { template: '' },
    });
    const roundStats = jasmine.createSpyObj(
      'QuestionnaireChoiceRoundStatsByRoundIdGql',
      ['watch']
    );
    roundStats.watch.and.returnValue({ valueChanges: NEVER });
    const themeService = jasmine.createSpyObj('ThemeService', [
      'getBarColors',
      'getColor',
    ]);
    themeService.getBarColors.and.returnValue(['bar-1', 'bar-2']);
    themeService.getColor.and.callFake((name: string) => name);

    configureTestModule(
      [ChoiceResultsComponent],
      [
        {
          provide: QuestionnaireChoiceRoundStatsByRoundIdGql,
          useValue: roundStats,
        },
        {
          provide: ThemeService,
          useValue: themeService,
        },
        {
          provide: PresentationService,
          useValue: { scale: () => 1 },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ChoiceResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('roundId', 'round-1');
    fixture.componentRef.setInput('formatData', {
      format: ContentType.Choice,
      options: [],
      ...formatData,
    });
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  it('passes both the raw and the rendered label to the answer list', () => {
    setUp({ options: [{ label: '**A**', labelRendered: '<p><b>A</b></p>' }] });

    expect(component.answerItems()[0]).toEqual(
      jasmine.objectContaining({
        label: '**A**',
        labelRendered: '<p><b>A</b></p>',
      })
    );
  });

  function barColors() {
    return component.visualizationData().datasets[0].colors;
  }

  it('cycles the palette while the correct answer is hidden', () => {
    setUp({ options, correctOptionIndexes: [0] }, { hasCorrectAnswer: true });

    expect(barColors()).toEqual(['bar-1', 'bar-2', 'bar-1']);
  });

  it('keeps the palette colour of a single correct option on reveal', () => {
    setUp(
      { options, correctOptionIndexes: [1] },
      { hasCorrectAnswer: true, showCorrect: true }
    );

    expect(barColors()).toEqual(['grey', 'bar-2', 'grey']);
  });

  it('turns several correct options green on reveal', () => {
    setUp(
      { options, correctOptionIndexes: [0, 2] },
      { hasCorrectAnswer: true, showCorrect: true }
    );

    expect(barColors()).toEqual(['green', 'grey', 'green']);
  });

  it('does not recolour a content without a correct answer', () => {
    setUp({ options }, { showCorrect: true });

    expect(barColors()).toEqual(['bar-1', 'bar-2', 'bar-1']);
  });
});
