import { Type } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentService } from '@app/core/services/http/content.service';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { AnnounceService } from '@app/core/services/util/announce.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { QuestionnairePageService } from '@app/creator/questionnaire/questionnaire-page.service';
import {
  ContentType,
  Questionnaire,
  QuestionnaireType,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { ContentEditingComponent } from './content-editing.component';
import { WordcloudContentFormComponent } from './wordcloud-content-form/wordcloud-content-form.component';

describe('ContentEditingComponent', () => {
  let fixture: ComponentFixture<ContentEditingComponent>;
  let component: ContentEditingComponent;

  function setUp() {
    // Only the form outlet and the body input matter to the reset under test.
    TestBed.overrideComponent(ContentEditingComponent, {
      set: {
        template: `
          <textarea #questionInput></textarea>
          @let _formatComponent = formatComponent()?.component;
          @if (_formatComponent) {
            <ng-container
              *ngComponentOutlet="_formatComponent; inputs: componentInputs()"
            />
          }
        `,
      },
    });
    for (const form of [
      ChoiceContentFormComponent,
      WordcloudContentFormComponent,
    ]) {
      TestBed.overrideComponent(form, { set: { template: '' } });
    }

    const contentService = jasmine.createSpyObj('ContentService', [
      'getTypeIcons',
    ]);
    contentService.getTypeIcons.and.returnValue(
      new Map([
        [ContentType.Choice, 'list'],
        [ContentType.Wordcloud, 'cloud'],
      ])
    );
    const contentGroupService = jasmine.createSpyObj('ContentGroupService', [
      'getContentFormatsOfQuestionnaireType',
    ]);
    contentGroupService.getContentFormatsOfQuestionnaireType.and.returnValue([
      ContentType.Choice,
      ContentType.Wordcloud,
    ]);

    configureTestModule(
      [getTranslocoModule(), ContentEditingComponent],
      [
        { provide: ContentService, useValue: contentService },
        { provide: ContentGroupService, useValue: contentGroupService },
        spyProvider(AnnounceService, ['announce']),
        spyProvider(ContentPublishService, ['isLive']),
        spyProvider(FormattingService, ['containsTextAnImage']),
        spyProvider(NotificationService, ['showAdvanced']),
        spyProvider(QuestionnairePageService, ['updateEditedContent']),
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(ContentEditingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questionnaire', {
      id: 'questionnaire-1',
      type: QuestionnaireType.Mixed,
    } as Questionnaire);
    fixture.componentRef.setInput('language', 'en');
    fixture.detectChanges();
  }

  function spyProvider<T>(token: Type<T>, methods: string[]) {
    return {
      provide: token,
      useValue: jasmine.createSpyObj(token.name, methods),
    };
  }

  function emitSubmitted(form: Type<{ submitted: { emit(): void } }>) {
    fixture.debugElement
      .query(By.directive(form))
      .componentInstance.submitted.emit();
  }

  describe('settings validation', () => {
    function submitWith(duration: string, weight: string) {
      setUp();
      component.question.set('Question');
      component.setDuration(duration);
      component.setWeight(weight);
      const form = fixture.debugElement.query(
        By.directive(ChoiceContentFormComponent)
      ).componentInstance;
      spyOn(form, 'submit');

      component.submitContent();

      return {
        submitted: form.submit.calls.count() === 1,
        warned: TestBed.inject(NotificationService).showAdvanced as jasmine.Spy,
      };
    }

    it('submits a content with a timer and weight in range', () => {
      const { submitted, warned } = submitWith('60', '3');
      expect(submitted).toBeTrue();
      expect(warned).not.toHaveBeenCalled();
    });

    it('submits a content without a timer', () => {
      expect(submitWith('', '1').submitted).toBeTrue();
    });

    it('rejects a timer below the minimum', () => {
      const { submitted, warned } = submitWith('5', '1');
      expect(submitted).toBeFalse();
      expect(warned).toHaveBeenCalled();
    });

    it('rejects a timer that is no whole number', () => {
      expect(submitWith('10.5', '1').submitted).toBeFalse();
    });

    it('rejects a weight above the maximum', () => {
      const { submitted, warned } = submitWith('', '6');
      expect(submitted).toBeFalse();
      expect(warned).toHaveBeenCalled();
    });

    it('rejects an empty weight', () => {
      expect(submitWith('', '').submitted).toBeFalse();
    });
  });

  it('resets the body after a content has been created', fakeAsync(() => {
    setUp();
    component.question.set('First question');

    emitSubmitted(ChoiceContentFormComponent);
    flush();

    expect(component.question()).toBe('');
  }));

  it('resets the body for the form of a newly selected format', fakeAsync(() => {
    setUp();
    component.formatChanged(component.formats()[1]);
    fixture.detectChanges();
    component.question.set('Second question');

    emitSubmitted(WordcloudContentFormComponent);
    flush();

    expect(component.question()).toBe('');
  }));
});
