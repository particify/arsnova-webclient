import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  CreateQuestionnaireSlideContentGql,
  UpdateQuestionnaireSlideContentGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { SlideContentFormComponent } from './slide-content-form.component';

describe('SlideContentFormComponent', () => {
  let fixture: ComponentFixture<SlideContentFormComponent>;
  let component: SlideContentFormComponent;
  let createContent: jasmine.SpyObj<CreateQuestionnaireSlideContentGql>;
  let updateContent: jasmine.SpyObj<UpdateQuestionnaireSlideContentGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let pageService: jasmine.SpyObj<QuestionnairePageService>;

  function setUp(contentId?: string) {
    createContent = jasmine.createSpyObj('CreateQuestionnaireSlideContentGql', [
      'mutate',
    ]);
    createContent.mutate.and.returnValue(
      of({ data: { createQuestionnaireSlideContent: { id: 'c-1' } } }) as never
    );
    updateContent = jasmine.createSpyObj('UpdateQuestionnaireSlideContentGql', [
      'mutate',
    ]);
    updateContent.mutate.and.returnValue(
      of({ data: { updateQuestionnaireSlideContent: { id: 'c-1' } } }) as never
    );
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    pageService = jasmine.createSpyObj('QuestionnairePageService', [
      'updateEditedContent',
    ]);

    configureTestModule(
      [getTranslocoModule(), SlideContentFormComponent],
      [
        {
          provide: CreateQuestionnaireSlideContentGql,
          useValue: createContent,
        },
        {
          provide: UpdateQuestionnaireSlideContentGql,
          useValue: updateContent,
        },
        { provide: NotificationService, useValue: notificationService },
        { provide: QuestionnairePageService, useValue: pageService },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(SlideContentFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('formatData', null);
    if (contentId) {
      fixture.componentRef.setInput('contentId', contentId);
    }
    fixture.detectChanges();
  }

  it('has no format data to validate', () => {
    setUp();

    expect(component.formatDataValid()).toBeTrue();
  });

  it('creates a slide with just its body and reports it as submitted', () => {
    setUp();
    const submitted = jasmine.createSpy('submitted');
    component.submitted.subscribe(submitted);

    component.submit('q-1', 'Welcome');

    expect(createContent.mutate.calls.mostRecent().args[0].variables).toEqual({
      input: { questionnaireId: 'q-1', body: 'Welcome' },
    });
    expect(updateContent.mutate).not.toHaveBeenCalled();
    expect(submitted).toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalled();
  });

  it('updates an existing slide and hands it to the page', () => {
    setUp('c-1');

    component.submit('q-1', 'Welcome back');

    expect(updateContent.mutate.calls.mostRecent().args[0].variables).toEqual({
      input: { id: 'c-1', body: 'Welcome back' },
    });
    expect(createContent.mutate).not.toHaveBeenCalled();
    expect(pageService.updateEditedContent).toHaveBeenCalledWith({
      id: 'c-1',
    } as never);
  });
});
