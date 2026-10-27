import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CombinedGraphQLErrors } from '@apollo/client';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  ContentGroupTemplateEditingComponent,
  TemplateFormValue,
} from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import {
  CreateTemplateFromQuestionnaireGql,
  TemplateContentAttributionsByQuestionnaireIdGql,
  TemplateLicenseFragment,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { TranslocoPipe } from '@jsverse/transloco';
import { NEVER, Subject, of, throwError } from 'rxjs';
import { CreateContentGroupTemplateComponent } from './create-content-group-template.component';

describe('CreateContentGroupTemplateComponent', () => {
  let fixture: ComponentFixture<CreateContentGroupTemplateComponent>;
  let component: CreateContentGroupTemplateComponent;
  let createGql: jasmine.SpyObj<CreateTemplateFromQuestionnaireGql>;
  let attributionsGql: jasmine.SpyObj<TemplateContentAttributionsByQuestionnaireIdGql>;
  let dialogRef: jasmine.SpyObj<
    MatDialogRef<CreateContentGroupTemplateComponent>
  >;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const formValue: TemplateFormValue = {
    aiGenerated: false,
    attribution: '',
    description: 'A quiz',
    language: 'en',
    licenseId: 'CC0-1.0',
    name: 'Template',
    published: true,
    tagNames: ['Math'],
  };
  const CC0 = {
    __typename: 'TemplateLicense' as const,
    id: 'CC0-1.0',
    name: 'CC0 1.0',
    url: null,
  };
  const CC_BY = {
    __typename: 'TemplateLicense' as const,
    id: 'CC-BY-4.0',
    name: 'CC BY 4.0',
    url: null,
  };

  beforeEach(() => {
    createGql = jasmine.createSpyObj('CreateTemplateFromQuestionnaireGql', [
      'mutate',
    ]);
    createGql.mutate.and.returnValue(of({ data: {} }) as never);
    attributionsGql = jasmine.createSpyObj(
      'TemplateContentAttributionsByQuestionnaireIdGql',
      ['fetch']
    );
    copiedUnder([]);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
  });

  function create(render = false) {
    // Rendering leaves out the child components, which have their own specs.
    // Without a strategy of its own, the AOT build compiles the component
    // OnPush, while TestBed's recompilation defaults to Eager.
    TestBed.overrideComponent(CreateContentGroupTemplateComponent, {
      set: render
        ? {
            imports: [TranslocoPipe],
            schemas: [NO_ERRORS_SCHEMA],
            changeDetection: ChangeDetectionStrategy.OnPush,
          }
        : { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), CreateContentGroupTemplateComponent],
      [
        { provide: CreateTemplateFromQuestionnaireGql, useValue: createGql },
        {
          provide: TemplateContentAttributionsByQuestionnaireIdGql,
          useValue: attributionsGql,
        },
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { name: 'Quiz', questionnaireId: 'q-1' },
        },
        { provide: NotificationService, useValue: notificationService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(CreateContentGroupTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function copiedUnder(licenses: (TemplateLicenseFragment | null)[]) {
    const attributions = licenses.map((license, i) => ({
      attribution: null,
      contentId: 'c-' + i,
      license,
      templateId: 't-1',
      upstreamAttributions: [],
    }));
    attributionsGql.fetch.and.returnValue(
      of({
        data: { templateContentAttributionsByQuestionnaireId: attributions },
      }) as never
    );
  }

  function editing(value?: TemplateFormValue) {
    spyOn(component, 'templateEditing').and.returnValue({
      getTemplate: () => value,
    } as ContentGroupTemplateEditingComponent);
  }

  it('creates the template from the questionnaire and closes', () => {
    create();
    editing({ ...formValue, attribution: 'Jane' });
    component.publish();
    expect(createGql.mutate).toHaveBeenCalledOnceWith({
      variables: {
        input: { ...formValue, attribution: 'Jane', questionnaireId: 'q-1' },
      },
    });
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('sends no attribution rather than an empty one', () => {
    create();
    editing(formValue);
    component.publish();
    expect(
      createGql.mutate.calls.mostRecent().args[0]?.variables?.input.attribution
    ).toBeUndefined();
  });

  it('creates nothing while the form is invalid', () => {
    create();
    editing(undefined);
    component.publish();
    expect(createGql.mutate).not.toHaveBeenCalled();
  });

  it('inherits the licence the contents were copied under', () => {
    copiedUnder([CC_BY, null, CC_BY]);
    create();
    expect(attributionsGql.fetch).toHaveBeenCalledOnceWith({
      variables: { questionnaireId: 'q-1' },
      fetchPolicy: 'network-only',
    });
    expect(component.inheritedLicense()).toEqual(CC_BY);
    expect(component.isLoading()).toBeFalse();
  });

  it('inherits no licence from contents copied without one', () => {
    copiedUnder([null]);
    create();
    expect(component.inheritedLicense()).toBeUndefined();
    expect(component.isLoading()).toBeFalse();
  });

  it('inherits no licence from contents copied under different ones', () => {
    copiedUnder([CC_BY, CC0]);
    create();
    expect(component.inheritedLicense()).toBeUndefined();
  });

  it('creates nothing before the inherited licence is known', () => {
    attributionsGql.fetch.and.returnValue(NEVER as never);
    create();
    component.publish();
    expect(createGql.mutate).not.toHaveBeenCalled();
  });

  it('is compiled OnPush by the build', () => {
    expect(
      (
        CreateContentGroupTemplateComponent as unknown as {
          ɵcmp: { onPush: boolean };
        }
      ).ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows the form once the inherited licence is known', () => {
    const attributions$ = new Subject<unknown>();
    attributionsGql.fetch.and.returnValue(attributions$ as never);
    create(true);
    const element: HTMLElement = fixture.nativeElement;
    attributions$.next({
      data: { templateContentAttributionsByQuestionnaireId: [] },
    });
    fixture.detectChanges();
    expect(element.querySelector('app-loading-indicator')).toBeNull();
    expect(
      element.querySelector('app-content-group-template-editing')
    ).not.toBeNull();
  });

  it('shows the loading indicator instead of the form while the licence is pending', () => {
    attributionsGql.fetch.and.returnValue(NEVER as never);
    create(true);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-loading-indicator')).not.toBeNull();
    expect(
      element.querySelector('app-content-group-template-editing')
    ).toBeNull();
  });

  describe('when the attributions cannot be loaded', () => {
    beforeEach(() => {
      attributionsGql.fetch.and.returnValue(
        throwError(
          () =>
            new CombinedGraphQLErrors({
              errors: [{ message: 'Internal error' }],
            })
        ) as never
      );
    });

    it('reports the failure', () => {
      create();
      expect(notificationService.showAdvanced).toHaveBeenCalledTimes(1);
      expect(component.loadFailed()).toBeTrue();
      expect(component.isLoading()).toBeFalse();
    });

    it('offers no form to choose an unlocked licence in', () => {
      create(true);
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector('app-loading-indicator')).toBeNull();
      expect(
        element.querySelector('app-content-group-template-editing')
      ).toBeNull();
      expect(element.textContent).toContain('errors.something-went-wrong');
    });

    it('creates nothing', () => {
      create();
      component.publish();
      expect(createGql.mutate).not.toHaveBeenCalled();
    });
  });
});
