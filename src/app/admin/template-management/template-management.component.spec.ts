import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogService } from '@app/core/services/util/dialog.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  AdminDeleteTemplateTagGql,
  AdminUpdateTemplateTagNameGql,
  AdminUpdateTemplateTagVerifiedGql,
  TemplateTagFragment,
  TemplateTagsByLanguageGql,
} from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { Observable, Subject, of } from 'rxjs';
import { TemplateLanguageSelectionComponent } from '@app/standalone/template-language-selection/template-language-selection.component';
import { TemplateManagementComponent } from './template-management.component';

describe('TemplateManagementComponent', () => {
  let fixture: ComponentFixture<TemplateManagementComponent>;
  let component: TemplateManagementComponent;
  let tagsGql: jasmine.SpyObj<TemplateTagsByLanguageGql>;
  let renameGql: jasmine.SpyObj<AdminUpdateTemplateTagNameGql>;
  let verifyGql: jasmine.SpyObj<AdminUpdateTemplateTagVerifiedGql>;
  let deleteGql: jasmine.SpyObj<AdminDeleteTemplateTagGql>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let clicked$: Subject<string>;
  let dialogRef: {
    componentInstance: { clicked$: Subject<string> };
    close: jasmine.Spy;
  };

  const math: TemplateTagFragment = {
    __typename: 'TemplateTag',
    id: 'tag-1',
    name: 'Math',
    verified: true,
  };
  const phys: TemplateTagFragment = {
    __typename: 'TemplateTag',
    id: 'tag-2',
    name: 'phys',
    verified: false,
  };

  beforeEach(() => {
    tagsGql = jasmine.createSpyObj('TemplateTagsByLanguageGql', ['fetch']);
    // Both requests may overlap; the list must not show a tag twice.
    tagsGql.fetch.and.callFake(
      (options) =>
        of({
          data: {
            templateTagsByLanguage: options?.variables?.verified
              ? [math]
              : [math, phys],
          },
        }) as never
    );
    renameGql = jasmine.createSpyObj('AdminUpdateTemplateTagNameGql', [
      'mutate',
    ]);
    renameGql.mutate.and.callFake(
      (options) =>
        of({
          data: {
            adminUpdateTemplateTagName: {
              ...phys,
              id: options!.variables!.id,
              name: options!.variables!.name,
            },
          },
        }) as never
    );
    verifyGql = jasmine.createSpyObj('AdminUpdateTemplateTagVerifiedGql', [
      'mutate',
    ]);
    verifyGql.mutate.and.callFake(
      (options) =>
        of({
          data: {
            adminUpdateTemplateTagVerified: {
              __typename: 'TemplateTag',
              id: options!.variables!.id,
              name: options!.variables!.id === 'tag-2' ? 'Physics' : 'Math',
              verified: options!.variables!.verified,
            },
          },
        }) as never
    );
    deleteGql = jasmine.createSpyObj('AdminDeleteTemplateTagGql', ['mutate']);
    clicked$ = new Subject();
    dialogRef = { componentInstance: { clicked$ }, close: jasmine.createSpy() };
    dialogService = jasmine.createSpyObj('DialogService', [
      'openDeleteDialog',
      'openDialog',
    ]);
    dialogService.openDialog.and.returnValue(dialogRef as never);
    dialogService.openDeleteDialog.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    TestBed.overrideComponent(TemplateManagementComponent, {
      set: { template: '' },
    });
    create();
  });

  function create() {
    configureTestModule(
      [getTranslocoModule(), TemplateManagementComponent],
      [
        { provide: TemplateTagsByLanguageGql, useValue: tagsGql },
        { provide: AdminUpdateTemplateTagNameGql, useValue: renameGql },
        { provide: AdminUpdateTemplateTagVerifiedGql, useValue: verifyGql },
        { provide: AdminDeleteTemplateTagGql, useValue: deleteGql },
        { provide: DialogService, useValue: dialogService },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(TemplateManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  /**
   * Without a strategy of its own, the AOT build compiles the component OnPush,
   * while TestBed's recompilation of an overridden component defaults to Eager.
   * The language selection has its own spec.
   */
  function recreateAsBuilt() {
    TestBed.resetTestingModule();
    TestBed.overrideComponent(TemplateManagementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.OnPush },
    });
    TestBed.overrideComponent(TemplateManagementComponent, {
      add: { schemas: [NO_ERRORS_SCHEMA] },
      remove: { imports: [TemplateLanguageSelectionComponent] },
    });
    create();
  }

  it('is compiled OnPush by the build', () => {
    // Undoes the override of the stubbed template.
    TestBed.resetTestingModule();
    expect(
      (TemplateManagementComponent as unknown as { ɵcmp: { onPush: boolean } })
        .ɵcmp.onPush
    ).toBeTrue();
  });

  it('shows the tags once they have loaded', () => {
    const tags$ = new Subject<unknown>();
    tagsGql.fetch.and.returnValue(tags$ as never);
    recreateAsBuilt();
    const items = () =>
      fixture.nativeElement.querySelectorAll('mat-list-item').length;
    expect(items()).toBe(0);
    tags$.next({ data: { templateTagsByLanguage: [math, phys] } });
    tags$.complete();
    fixture.detectChanges();
    expect(items()).toBe(2);
  });

  it('lists verified and unverified tags of the language once each', () => {
    expect(tagsGql.fetch.calls.allArgs().map((a) => a[0]?.variables)).toEqual([
      { language: 'en', verified: false },
      { language: 'en', verified: true },
    ]);
    expect(component.tags().map((t) => t.id)).toEqual(['tag-1', 'tag-2']);
    expect(component.isLoading()).toBeFalse();
  });

  it('filters by verification', () => {
    component.filterTags(component.FILTER.UNVERIFIED);
    expect(component.filteredTags()).toEqual([phys]);
    component.filterTags(component.FILTER.VERIFIED);
    expect(component.filteredTags()).toEqual([math]);
  });

  it('keeps a toggled tag listed until the filter changes', () => {
    component.filterTags(component.FILTER.UNVERIFIED);
    expect(component.filteredTags()).toEqual([phys]);
    component.toggleVerified(phys);
    expect(component.filteredTags()).toEqual([
      jasmine.objectContaining({ id: 'tag-2', verified: true }),
    ]);
    component.filterTags(component.FILTER.VERIFIED);
    expect(component.filteredTags().map((t) => t.id)).toEqual([
      'tag-1',
      'tag-2',
    ]);
    component.filterTags(component.FILTER.UNVERIFIED);
    expect(component.filteredTags()).toEqual([]);
  });

  it('keeps an unverified tag listed under the verified filter', () => {
    component.filterTags(component.FILTER.VERIFIED);
    expect(component.filteredTags()).toEqual([math]);
    component.toggleVerified(math);
    expect(component.filteredTags()).toEqual([
      jasmine.objectContaining({ id: 'tag-1', verified: false }),
    ]);
  });

  it('toggles the verification in place', () => {
    component.toggleVerified(phys);
    expect(verifyGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'tag-2', verified: true },
    });
    expect(component.tags()[1]).toEqual(
      jasmine.objectContaining({ id: 'tag-2', verified: true })
    );
  });

  it('renames and verifies an unverified tag', () => {
    component.edit(phys);
    clicked$.next('Physics');
    expect(renameGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'tag-2', name: 'Physics' },
    });
    expect(verifyGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'tag-2', verified: true },
    });
    expect(dialogRef.close).toHaveBeenCalled();
    expect(component.tags()[1]).toEqual({
      __typename: 'TemplateTag',
      id: 'tag-2',
      name: 'Physics',
      verified: true,
    });
  });

  it('only verifies a tag whose name is kept', () => {
    component.edit(phys);
    clicked$.next('phys');
    expect(renameGql.mutate).not.toHaveBeenCalled();
    expect(verifyGql.mutate).toHaveBeenCalledTimes(1);
  });

  it('only renames a verified tag', () => {
    renameGql.mutate.and.returnValue(
      of({
        data: { adminUpdateTemplateTagName: { ...math, name: 'Maths' } },
      }) as never
    );
    component.edit(math);
    clicked$.next('Maths');
    expect(verifyGql.mutate).not.toHaveBeenCalled();
    expect(component.tags()[0].name).toBe('Maths');
  });

  it('removes a tag once its deletion is confirmed', () => {
    component.delete(math);
    const confirm = dialogService.openDeleteDialog.calls.mostRecent()
      .args[4] as () => Observable<unknown>;
    confirm();
    expect(deleteGql.mutate).toHaveBeenCalledOnceWith({
      variables: { id: 'tag-1' },
    });
    expect(component.tags()).toEqual([phys]);
    expect(component.filteredTags()).toEqual([phys]);
  });
});
