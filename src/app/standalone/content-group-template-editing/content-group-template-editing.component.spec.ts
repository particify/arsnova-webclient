import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormService } from '@app/core/services/util/form.service';
import {
  QuestionnaireType,
  TemplateDetailsFragment,
  TemplateLicenseFragment,
  TemplateLicensesGql,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, Subject, of } from 'rxjs';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateTagSelectionComponent } from '@app/standalone/template-tag-selection/template-tag-selection.component';
import { ContentGroupTemplateEditingComponent } from './content-group-template-editing.component';

describe('ContentGroupTemplateEditingComponent', () => {
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
  const RETIRED = {
    __typename: 'TemplateLicense' as const,
    id: 'RETIRED-1.0',
    name: 'Retired',
    url: null,
  };

  function setUp(
    template?: Partial<TemplateDetailsFragment>,
    inheritedLicense?: TemplateLicenseFragment,
    licenses$: Observable<unknown> = of({
      data: { templateLicenses: [CC_BY, CC0] },
    }),
    asBuilt = false
  ) {
    // Without a strategy of its own, the AOT build compiles the component
    // OnPush, while TestBed's recompilation defaults to Eager. The child
    // components have their own specs.
    TestBed.overrideComponent(ContentGroupTemplateEditingComponent, {
      set: asBuilt
        ? { changeDetection: ChangeDetectionStrategy.OnPush }
        : { template: '' },
    });
    if (asBuilt) {
      TestBed.overrideComponent(ContentGroupTemplateEditingComponent, {
        add: { schemas: [NO_ERRORS_SCHEMA] },
        remove: {
          imports: [
            SettingsSlideToggleComponent,
            TemplateLanguageSelectionComponent,
            TemplateTagSelectionComponent,
          ],
        },
      });
    }
    configureTestModule(
      [getTranslocoModule(), ContentGroupTemplateEditingComponent],
      [
        { provide: TemplateLicensesGql, useValue: { fetch: () => licenses$ } },
        {
          provide: TemplateTagsByLanguageGql,
          useValue: {
            fetch: () => of({ data: { templateTagsByLanguage: [] } }),
          },
        },
      ]
    ).compileComponents();
    const fixture = TestBed.createComponent(
      ContentGroupTemplateEditingComponent
    );
    if (template) {
      fixture.componentRef.setInput('template', {
        __typename: 'Template',
        id: 't-1',
        aiGenerated: false,
        attribution: null,
        contentCount: 1,
        createdByCurrentUser: true,
        description: null,
        language: 'en',
        license: null,
        name: 'Template',
        published: true,
        questionnaireId: 't-1',
        questionnaireType: QuestionnaireType.Quiz,
        tags: [],
        ...template,
      });
    }
    fixture.componentRef.setInput('inheritedLicense', inheritedLicense);
    fixture.detectChanges();
    return fixture;
  }

  it('is compiled OnPush by the build', () => {
    expect(
      (
        ContentGroupTemplateEditingComponent as unknown as {
          ɵcmp: { onPush: boolean };
        }
      ).ɵcmp.onPush
    ).toBeTrue();
  });

  it('applies the default licence once the licences have loaded', () => {
    const licenses$ = new Subject<unknown>();
    const fixture = setUp({ license: null }, undefined, licenses$, true);
    const element: HTMLElement = fixture.nativeElement;
    // Only the public domain licence makes the attribution optional.
    expect(element.textContent).not.toContain('templates.optional');
    licenses$.next({ data: { templateLicenses: [CC_BY, CC0] } });
    fixture.detectChanges();
    expect(element.textContent).toContain('templates.optional');
  });

  it('asks for an attribution once the template is to be published', () => {
    const fixture = setUp({ published: false }, undefined, undefined, true);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('#attributionInput')).toBeNull();
    fixture.componentInstance.published.set(true);
    fixture.detectChanges();
    expect(element.querySelector('#attributionInput')).not.toBeNull();
  });

  it('defaults a new template to the public domain licence', () => {
    const component = setUp().componentInstance;
    component.published.set(true);
    expect(component.prepareTemplate().licenseId).toBe(CC0.id);
    expect(component.isAttributionOptional()).toBeTrue();
  });

  it('sends no licence while unpublished', () => {
    const component = setUp().componentInstance;
    expect(component.prepareTemplate().licenseId).toBeUndefined();
  });

  it('never resends the licence of a template that has one', () => {
    const component = setUp({ license: CC_BY }).componentInstance;
    expect(component.prepareTemplate().licenseId).toBeUndefined();
    expect(component.isAttributionOptional()).toBeFalse();
  });

  it('keeps a retired licence of the template selectable for display', () => {
    const component = setUp({ license: RETIRED }).componentInstance;
    expect(component.licenses().map((l) => l.id)).toEqual([
      RETIRED.id,
      CC_BY.id,
      CC0.id,
    ]);
  });

  it('preselects and locks a licence inherited from copied contents', () => {
    const component = setUp(undefined, CC_BY).componentInstance;
    expect(component.selectedLicense()).toBe(CC_BY.id);
    expect(component['formGroup'].get('licenses')?.disabled).toBeTrue();
    expect(component.isAttributionOptional()).toBeFalse();
  });

  it('sends an inherited licence even while unpublished', () => {
    const component = setUp(undefined, CC_BY).componentInstance;
    expect(component.prepareTemplate().licenseId).toBe(CC_BY.id);
  });

  it('keeps an inherited licence locked when the form is re-enabled', () => {
    const component = setUp(undefined, CC_BY).componentInstance;
    TestBed.inject(FormService).disableForm();
    TestBed.inject(FormService).enableForm();
    expect(component['formGroup'].get('licenses')?.disabled).toBeTrue();
    expect(component['formGroup'].get('name')?.enabled).toBeTrue();
  });

  it('keeps a retired inherited licence selectable for display', () => {
    const component = setUp(undefined, RETIRED).componentInstance;
    expect(component.licenses().map((l) => l.id)).toEqual([
      RETIRED.id,
      CC_BY.id,
      CC0.id,
    ]);
  });

  it('sends tags by name', () => {
    const component = setUp({
      tags: [
        {
          __typename: 'TemplateTag',
          id: 'tag-1',
          name: 'Math',
          verified: true,
        },
      ],
    }).componentInstance;
    expect(component.prepareTemplate().tagNames).toEqual(['Math']);
  });

  it('keeps the tags when the language selection reports its initial language', () => {
    const component = setUp({
      tags: [
        {
          __typename: 'TemplateTag',
          id: 'tag-1',
          name: 'Math',
          verified: true,
        },
      ],
    }).componentInstance;
    component.updateLanguage('en');
    expect(component.selectedLang()).toBe('en');
    expect(component.prepareTemplate().tagNames).toEqual(['Math']);
  });

  it('switches to a different language', () => {
    const component = setUp({ tags: [] }).componentInstance;
    component.updateLanguage('de');
    expect(component.prepareTemplate().language).toBe('de');
  });
});
