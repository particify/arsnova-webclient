import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatAutocompleteHarness } from '@angular/material/autocomplete/testing';
import { AnnounceService } from '@app/core/services/util/announce.service';
import {
  TemplateTagFragment,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { TemplateTagSelectionComponent } from './template-tag-selection.component';

describe('TemplateTagSelectionComponent', () => {
  let fixture: ComponentFixture<TemplateTagSelectionComponent>;
  let component: TemplateTagSelectionComponent;
  let tagsGql: jasmine.SpyObj<TemplateTagsByLanguageGql>;
  let announceService: jasmine.SpyObj<AnnounceService>;
  let emitted: TemplateTagFragment[][];

  const math: TemplateTagFragment = {
    __typename: 'TemplateTag',
    id: 'tag-1',
    name: 'Math',
    verified: true,
  };
  const physics: TemplateTagFragment = {
    __typename: 'TemplateTag',
    id: 'tag-2',
    name: 'Physics',
    verified: true,
  };
  const mathe: TemplateTagFragment = {
    __typename: 'TemplateTag',
    id: 'tag-3',
    name: 'Mathe',
    verified: true,
  };

  function setUp(selectedTagIds: string[] = []) {
    tagsGql = jasmine.createSpyObj('TemplateTagsByLanguageGql', ['fetch']);
    tagsGql.fetch.and.callFake(
      (options) =>
        of({
          data: {
            templateTagsByLanguage:
              options?.variables?.language === 'de' ? [mathe] : [math, physics],
          },
        }) as never
    );
    announceService = jasmine.createSpyObj('AnnounceService', ['announce']);
    // Without a strategy of its own, the AOT build compiles the component
    // OnPush, while TestBed's recompilation defaults to Eager.
    TestBed.overrideComponent(TemplateTagSelectionComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    configureTestModule(
      [getTranslocoModule(), TemplateTagSelectionComponent],
      [
        { provide: TemplateTagsByLanguageGql, useValue: tagsGql },
        { provide: AnnounceService, useValue: announceService },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(TemplateTagSelectionComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.selectedTags.subscribe((tags) => emitted.push(tags));
    fixture.componentRef.setInput('lang', 'en');
    fixture.componentRef.setInput('selectedTagIds', selectedTagIds);
    fixture.detectChanges();
  }

  function tagInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  it('is compiled OnPush by the build', () => {
    expect(
      (
        TemplateTagSelectionComponent as unknown as {
          ɵcmp: { onPush: boolean };
        }
      ).ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows a selected tag as a chip', () => {
    setUp();
    select('Math');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mat-chip-row').length).toBe(
      1
    );
  });

  function select(name: string) {
    component.selected({
      option: { value: name, viewValue: name },
    } as MatAutocompleteSelectedEvent);
  }

  it('offers the tags of the language', () => {
    setUp();
    expect(tagsGql.fetch).toHaveBeenCalledOnceWith({
      variables: { language: 'en' },
    });
    expect(component.tags()).toEqual([math, physics]);
  });

  it('resolves preselected tag IDs and reports them', () => {
    setUp(['tag-2']);
    expect(component.selectedTags()).toEqual([physics]);
    expect(emitted).toEqual([[physics]]);
  });

  it('selects an offered tag', () => {
    setUp();
    select('Math');
    expect(component.selectedTags()).toEqual([math]);
    expect(emitted).toEqual([[math]]);
    expect(component.isTagSelected(math)).toBeTrue();
  });

  it('creates a tag that is not offered', async () => {
    setUp();
    fixture.componentRef.setInput('allowCreation', true);
    const autocomplete = await TestbedHarnessEnvironment.loader(
      fixture
    ).getHarness(MatAutocompleteHarness);
    await autocomplete.enterText('Biology');
    await autocomplete.selectOption({ text: /templates\.create-new-tag/ });
    expect(component.selectedTags()).toEqual([
      {
        __typename: 'TemplateTag',
        id: '',
        name: 'Biology',
        verified: false,
      },
    ]);
    expect(tagInput().value).toBe('');
  });

  it('removes a tag and announces it', () => {
    setUp();
    select('Math');
    select('Physics');
    component.remove(math);
    expect(component.selectedTags()).toEqual([physics]);
    expect(emitted[emitted.length - 1]).toEqual([physics]);
    expect(announceService.announce).toHaveBeenCalledOnceWith(
      'templates.tag-removed',
      { tag: math }
    );
  });

  it('starts over with the tags of another language', () => {
    setUp();
    select('Math');
    fixture.componentRef.setInput('lang', 'de');
    fixture.detectChanges();
    expect(component.selectedTags()).toEqual([]);
    expect(emitted[emitted.length - 1]).toEqual([]);
    expect(tagsGql.fetch).toHaveBeenCalledWith({
      variables: { language: 'de' },
    });
    expect(component.tags()).toEqual([mathe]);
  });
});
