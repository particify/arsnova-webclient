import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentResultsComponent } from '@app/standalone/content-results/content-results.component';
import { ContentResultsService } from '@app/standalone/content-results/content-results.service';
import { StepperComponent } from '@app/standalone/stepper/stepper.component';
import { Content, UserUiSettings } from '@gql/generated/graphql';
import { ContentStepperComponent } from './content-stepper.component';

function content(id: string): Content {
  return { id } as Content;
}

describe('ContentStepperComponent', () => {
  let fixture: ComponentFixture<ContentStepperComponent>;
  let component: ContentStepperComponent;
  let contentResultsService: jasmine.SpyObj<ContentResultsService>;

  function setUp() {
    // The results component pulls in the full GraphQL dependency graph, which
    // is irrelevant to the stepping logic under test here.
    TestBed.overrideComponent(ContentResultsComponent, {
      set: { template: '' },
    });

    contentResultsService = jasmine.createSpyObj('ContentResultsService', [
      'setResultsVisible',
      'setCorrectResultsVisible',
    ]);

    configureTestModule(
      [getTranslocoModule(), ContentStepperComponent, StepperComponent],
      [
        provideNoopAnimations(),
        { provide: ContentResultsService, useValue: contentResultsService },
        {
          provide: ContentAnswerService,
          useValue: jasmine.createSpyObj('ContentAnswerService', [
            'getAnswerResultIcon',
          ]),
        },
        {
          provide: ContentService,
          useValue: jasmine.createSpyObj('ContentService', ['getTypeIcons']),
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentStepperComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contents', [
      content('c-1'),
      content('c-2'),
      content('c-3'),
    ]);
    fixture.componentRef.setInput('settings', {} as UserUiSettings);
  }

  it('adopts a startIndex present already on the first change-detection round', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 1);
    fixture.detectChanges();
    expect(component.currentStep).toBe(1);
  });

  it('resyncs currentStep when startIndex is corrected on a later round, mirroring the real two-phase URL resolution', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 0);
    fixture.detectChanges();
    expect(component.currentStep).toBe(0);

    fixture.componentRef.setInput('startIndex', 2);
    fixture.detectChanges();
    expect(component.currentStep).toBe(2);
  });

  it('still resyncs currentStep through the stepper’s own navigation output', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 0);
    fixture.detectChanges();

    component.updateIndex(1);

    expect(component.currentStep).toBe(1);
    expect(contentResultsService.setResultsVisible).toHaveBeenCalledWith(false);
    expect(contentResultsService.setCorrectResultsVisible).toHaveBeenCalledWith(
      false
    );
  });

  it('keeps the rendered steps when the same contents are emitted again', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 0);
    fixture.detectChanges();
    const stepsBefore = component.stepper().steps.toArray();

    fixture.componentRef.setInput('contents', [
      content('c-1'),
      content('c-2'),
      content('c-3'),
    ]);
    fixture.detectChanges();

    const stepsAfter = component.stepper().steps.toArray();
    expect(stepsAfter.length).toBe(3);
    expect(stepsAfter).toEqual(stepsBefore);
  });

  it('emits the navigated index so the page can resync startIndex', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 0);
    fixture.detectChanges();

    const emitted: number[] = [];
    component.indexChanged.subscribe((index) => emitted.push(index));

    component.updateIndex(1);

    expect(emitted).toEqual([1]);
  });

  describe('in live mode', () => {
    function rendered(selector: string): Element | null {
      return fixture.nativeElement.querySelector(selector);
    }

    function presentLive(contents: Content[], startedContentId?: string) {
      setUp();
      fixture.componentRef.setInput('contents', contents);
      fixture.componentRef.setInput('startIndex', 0);
      fixture.componentRef.setInput('isLiveMode', true);
      fixture.componentRef.setInput('startedContentId', startedContentId);
      fixture.detectChanges();
      // The step is only rendered once the stepper has adopted the start index.
      fixture.detectChanges();
    }

    it('keeps a content which never ran waiting for its start', () => {
      presentLive(
        [{ ...content('c-1'), activeRound: { started: false } } as Content],
        'c-2'
      );

      expect(rendered('app-content-step-info')).not.toBeNull();
      expect(rendered('app-content-results')).toBeNull();
    });

    it('shows the content which is running', () => {
      presentLive([content('c-1')], 'c-1');

      expect(rendered('app-content-results')).not.toBeNull();
      expect(rendered('app-content-step-info')).toBeNull();
    });

    it('shows a content which ran before instead of waiting for its start again', () => {
      presentLive(
        [{ ...content('c-1'), activeRound: { started: true } } as Content],
        'c-2'
      );

      expect(rendered('app-content-results')).not.toBeNull();
      expect(rendered('app-content-step-info')).toBeNull();
    });
  });
});
