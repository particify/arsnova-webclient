import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputDialogComponent, DialogData } from './input-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@app/core/services/util/notification.service';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { configureTestModule } from '@testing/test.setup';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminUsersGql } from '@gql/generated/graphql';
import { of } from 'rxjs';

describe('InputDialogComponent', () => {
  let fixture: ComponentFixture<InputDialogComponent>;
  let loader: HarnessLoader;
  let emitted: string[];

  async function createComponent(data: Partial<DialogData>) {
    await configureTestModule(
      [BrowserAnimationsModule, getTranslocoModule(), InputDialogComponent],
      [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { inputName: 'login-id', primaryAction: 'add', ...data },
        },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', [
            'showAdvanced',
          ]),
        },
        {
          provide: AdminUsersGql,
          useValue: { watch: () => ({ valueChanges: of() }) },
        },
      ]
    ).compileComponents();

    fixture = TestBed.createComponent(InputDialogComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    emitted = [];
    fixture.componentInstance.clicked$.subscribe((v) => emitted.push(v));
    fixture.detectChanges();
  }

  async function enterAndSubmit(value: string) {
    await (await loader.getHarness(MatInputHarness)).setValue(value);
    await (
      await loader.getHarness(
        MatButtonHarness.with({ text: 'admin.admin-area.add' })
      )
    ).click();
  }

  it('should not emit an invalid mail address when mail validation is enabled', async () => {
    await createComponent({ validateMailAddress: true });
    await enterAndSubmit('mail@example.com>');

    expect(emitted).toEqual([]);
    const field = await loader.getHarness(MatFormFieldHarness);
    expect(await field.getTextErrors()).toEqual(['login.email-invalid']);
  });

  it('should emit a valid mail address when mail validation is enabled', async () => {
    await createComponent({ validateMailAddress: true });
    await enterAndSubmit('mail@example.com');

    expect(emitted).toEqual(['mail@example.com']);
  });

  it('should emit any input when mail validation is not enabled', async () => {
    await createComponent({});
    await enterAndSubmit('mail@example.com>');

    expect(emitted).toEqual(['mail@example.com>']);
  });
});
