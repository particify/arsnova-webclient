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
