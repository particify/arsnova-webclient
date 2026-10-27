import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@app/core/services/util/notification.service';
import {
  ContentGroupTemplateEditingComponent,
  TemplateFormValue,
} from '@app/standalone/content-group-template-editing/content-group-template-editing.component';
import { UpdateTemplateGql } from '@gql/generated/graphql';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of, throwError } from 'rxjs';
import { EditContentGroupTemplateComponent } from './edit-content-group-template.component';

describe('EditContentGroupTemplateComponent', () => {
  let fixture: ComponentFixture<EditContentGroupTemplateComponent>;
  let component: EditContentGroupTemplateComponent;
  let updateGql: jasmine.SpyObj<UpdateTemplateGql>;
  let dialogRef: jasmine.SpyObj<
    MatDialogRef<EditContentGroupTemplateComponent>
  >;

  const formValue: TemplateFormValue = {
    aiGenerated: false,
    attribution: 'Jane',
    description: 'A quiz',
    language: 'en',
    name: 'Template',
    published: true,
    tagNames: ['Math'],
  };

  beforeEach(() => {
    updateGql = jasmine.createSpyObj('UpdateTemplateGql', ['mutate']);
    updateGql.mutate.and.returnValue(
      of({ data: { updateTemplate: { id: 't-1' } } }) as never
    );
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.overrideComponent(EditContentGroupTemplateComponent, {
      set: { template: '' },
    });
    configureTestModule(
      [getTranslocoModule(), EditContentGroupTemplateComponent],
      [
        { provide: UpdateTemplateGql, useValue: updateGql },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { template: { id: 't-1' } } },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
      ]
    ).compileComponents();
    fixture = TestBed.createComponent(EditContentGroupTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function editing(value?: TemplateFormValue) {
    spyOn(component, 'templateEditing').and.returnValue({
      getTemplate: () => value,
    } as ContentGroupTemplateEditingComponent);
  }

  it('saves the form for the template and closes with the result', () => {
    editing(formValue);
    component.save();
    expect(updateGql.mutate).toHaveBeenCalledOnceWith({
      variables: { input: { id: 't-1', ...formValue } },
    });
    expect(dialogRef.close).toHaveBeenCalledOnceWith({ id: 't-1' } as never);
  });

  it('saves nothing while the form is invalid', () => {
    editing(undefined);
    component.save();
    expect(updateGql.mutate).not.toHaveBeenCalled();
  });

  it('stays open when saving fails', () => {
    updateGql.mutate.and.returnValue(throwError(() => new Error('nope')));
    editing(formValue);
    component.save();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.formDisabled).toBeFalse();
  });
});
