import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
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
    // The cdk-step content pulls in ContentResultsComponent's full GraphQL
    // dependency graph, which is irrelevant to the currentStep/effect logic
    // under test here - strip it down to just the stepper it wraps.
    TestBed.overrideComponent(ContentStepperComponent, {
      set: {
        template: `
          <app-stepper [listLength]="contents().length">
            @for (content of contents(); track content) {
              <cdk-step></cdk-step>
            }
          </app-stepper>
        `,
      },
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

  it('emits the navigated index so the page can resync startIndex', () => {
    setUp();
    fixture.componentRef.setInput('startIndex', 0);
    fixture.detectChanges();

    const emitted: number[] = [];
    component.indexChanged.subscribe((index) => emitted.push(index));

    component.updateIndex(1);

    expect(emitted).toEqual([1]);
  });
});
