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
  Content,
  ContentType,
  Questionnaire,
  QuestionnaireContentByIdGql,
  QuestionnaireType,
  ScaleContentTemplate,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { RouterModule } from '@angular/router';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { Subject } from 'rxjs';
import { ChoiceContentFormComponent } from './choice-content-form/choice-content-form.component';
import { ContentEditingComponent } from './content-editing.component';
import { WordcloudContentFormComponent } from './wordcloud-content-form/wordcloud-content-form.component';

function scaleContent(neutralOption: boolean): Content {
  return {
    id: 'content-1',
    body: 'How likely?',
    formatData: {
      __typename: 'ScaleContentFormatData',
      format: ContentType.Scale,
      template: ScaleContentTemplate.Probability,
      neutralOption,
    },
  } as unknown as Content;
}

function spyProvider<T>(token: Type<T>, methods: string[]) {
  return {
    provide: token,
    useValue: jasmine.createSpyObj(token.name, methods),
  };
}

describe('ContentEditingComponent', () => {
  let fixture: ComponentFixture<ContentEditingComponent>;
  let component: ContentEditingComponent;

  describe('after creating a content', () => {
    let cachedContent$: Subject<unknown>;

    function setUp(content?: Content, renderSettings = false) {
      cachedContent$ = new Subject();
      // Only the form outlet and the body input matter to the reset under test.
      if (!renderSettings) {
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
      }
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
        [
          getTranslocoModule(),
          RouterModule.forRoot([]),
          ContentEditingComponent,
        ],
        [
          { provide: ContentService, useValue: contentService },
          { provide: ContentGroupService, useValue: contentGroupService },
          spyProvider(AnnounceService, ['announce']),
          spyProvider(ContentPublishService, ['isLive']),
          spyProvider(FormattingService, ['containsTextAnImage']),
          spyProvider(NotificationService, ['showAdvanced']),
          spyProvider(QuestionnairePageService, ['updateEditedContent']),
          {
            provide: QuestionnaireContentByIdGql,
            useValue: { watch: () => ({ valueChanges: cachedContent$ }) },
          },
        ]
      ).compileComponents();

      fixture = TestBed.createComponent(ContentEditingComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('questionnaire', {
        id: 'questionnaire-1',
        type: QuestionnaireType.Mixed,
      } as Questionnaire);
      fixture.componentRef.setInput('language', 'en');
      if (content) {
        fixture.componentRef.setInput('content', content);
      }
      fixture.detectChanges();
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
          warned: TestBed.inject(NotificationService)
            .showAdvanced as jasmine.Spy,
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

    describe('answer lock', () => {
      function lockedWith(state: {
        hasAnswers: boolean;
        answerCount: number | null;
        roundNo?: number;
      }) {
        setUp({
          id: 'content-1',
          body: 'Question',
          answerCount: state.answerCount,
          hasAnswers: state.hasAnswers,
          activeRound: { id: 'round-1', roundNo: state.roundNo ?? 1 },
          formatData: {
            __typename: 'ChoiceContentFormatData',
            format: ContentType.Choice,
            multiple: false,
            options: [],
          },
        } as unknown as Content);
        const form = fixture.debugElement.query(
          By.directive(ChoiceContentFormComponent)
        ).componentInstance as ChoiceContentFormComponent;
        return form.answered();
      }

      it('keeps a content without answers editable', () => {
        expect(lockedWith({ hasAnswers: false, answerCount: 0 })).toBeFalse();
      });

      it('locks a content with answers in the active round', () => {
        expect(lockedWith({ hasAnswers: true, answerCount: 3 })).toBeTrue();
      });

      it('locks a content whose answers are hidden or in other rounds', () => {
        expect(lockedWith({ hasAnswers: true, answerCount: 0 })).toBeTrue();
      });

      it('locks a content with answers but no answer count', () => {
        expect(lockedWith({ hasAnswers: true, answerCount: null })).toBeTrue();
      });

      it('locks the content once its first answer arrives', () => {
        expect(lockedWith({ hasAnswers: false, answerCount: 0 })).toBeFalse();

        cachedContent$.next({
          dataState: 'complete',
          data: {
            questionnaireContentById: {
              ...component.content(),
              answerCount: 1,
              hasAnswers: true,
            },
          },
        });
        fixture.detectChanges();

        const form = fixture.debugElement.query(
          By.directive(ChoiceContentFormComponent)
        ).componentInstance as ChoiceContentFormComponent;
        expect(form.answered()).toBeTrue();
      });

      it('locks a wordcloud content with answers', () => {
        setUp({
          id: 'content-1',
          body: 'Question',
          hasAnswers: true,
          formatData: {
            __typename: 'WordcloudContentFormatData',
            format: ContentType.Wordcloud,
            maxAnswers: 3,
          },
        } as unknown as Content);

        const form = fixture.debugElement.query(
          By.directive(WordcloudContentFormComponent)
        ).componentInstance as WordcloudContentFormComponent;
        expect(form.locked()).toBeTrue();
      });

      describe('multiple selection toggle', () => {
        function multipleToggles(hasAnswers: boolean) {
          setUp(
            {
              id: 'content-1',
              body: 'Question',
              hasAnswers,
              formatData: {
                __typename: 'ChoiceContentFormatData',
                format: ContentType.Choice,
                multiple: false,
                options: [],
              },
            } as unknown as Content,
            true
          );
          return fixture.debugElement
            .queryAll(By.directive(SettingsSlideToggleComponent))
            .map((t) => t.componentInstance as SettingsSlideToggleComponent)
            .filter(
              (t) => t.label === 'creator.content.select-multiple-options'
            );
        }

        it('keeps it editable while the content has no answers', () => {
          const toggles = multipleToggles(false);

          expect(toggles.length).toBeGreaterThan(0);
          expect(toggles.every((t) => !t.disabled)).toBeTrue();
        });

        it('locks it once the content has answers', () => {
          const toggles = multipleToggles(true);

          expect(toggles.length).toBeGreaterThan(0);
          expect(toggles.every((t) => t.disabled)).toBeTrue();
        });
      });

      it('keeps a new round editable after rounds without answers', () => {
        expect(
          lockedWith({ hasAnswers: false, answerCount: 0, roundNo: 2 })
        ).toBeFalse();
      });
    });
  });

  /**
   * Never calls detectChanges: reading the signals needs no rendering, which keeps
   * the format outlet and its services out of the harness.
   */
  describe('neutral option', () => {
    function setUp(content?: Content) {
      configureTestModule(
        [getTranslocoModule(), ContentEditingComponent],
        [
          {
            provide: ContentService,
            useValue: { getTypeIcons: () => new Map() },
          },
          {
            provide: ContentGroupService,
            useValue: { getContentFormatsOfQuestionnaireType: () => [] },
          },
          spyProvider(FormattingService, ['containsTextAnImage']),
          spyProvider(NotificationService, ['showAdvanced']),
        ]
      ).compileComponents();

      fixture = TestBed.createComponent(ContentEditingComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('questionnaire', {
        id: 'questionnaire-1',
        type: QuestionnaireType.Survey,
      } as Questionnaire);
      fixture.componentRef.setInput('language', 'en');
      if (content) {
        fixture.componentRef.setInput('content', content);
      }
    }

    it('offers the neutral option by default on a new content', () => {
      setUp();
      expect(component.neutralOption()).toBe(true);
    });

    it('seeds the neutral option from a content present at creation', () => {
      setUp(scaleContent(false));
      expect(component.neutralOption()).toBe(false);
    });

    it('seeds the neutral option from a content arriving after creation', () => {
      setUp();
      fixture.componentRef.setInput('content', scaleContent(false));
      expect(component.neutralOption()).toBe(false);
    });

    it('keeps a just-flipped neutral option when the content re-emits', () => {
      setUp(scaleContent(true));
      component.neutralOption.set(false);

      fixture.componentRef.setInput('content', scaleContent(true));

      expect(component.neutralOption()).toBe(false);
    });

    it('re-seeds the neutral option when the persisted flag itself changes', () => {
      setUp(scaleContent(true));
      fixture.componentRef.setInput('content', scaleContent(false));
      expect(component.neutralOption()).toBe(false);
    });
  });
});
