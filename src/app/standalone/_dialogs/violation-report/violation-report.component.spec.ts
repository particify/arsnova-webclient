import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import {
  CreateViolationReportGql,
  ViolationReportReason,
  ViolationReportTargetType,
} from '@gql/generated/graphql';
import { getViolationReportReasonKey } from '@app/core/utils/violation-report';
import { MockMatDialogRef } from '@testing/test-helpers';
import { configureTestModule } from '@testing/test.setup';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { of } from 'rxjs';
import { ViolationReportComponent } from './violation-report.component';

describe('ViolationReportComponent', () => {
  let component: ViolationReportComponent;
  let loader: HarnessLoader;
  let createGql: jasmine.SpyObj<CreateViolationReportGql>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    createGql = jasmine.createSpyObj('CreateViolationReportGql', ['mutate']);
    createGql.mutate.and.returnValue(of({ data: {} }) as never);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showAdvanced',
    ]);
    await configureTestModule(
      [getTranslocoModule(), NoopAnimationsModule, ViolationReportComponent],
      [
        { provide: CreateViolationReportGql, useValue: createGql },
        { provide: NotificationService, useValue: notificationService },
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            targetType: ViolationReportTargetType.Template,
            targetId: 'template-1',
          },
        },
      ]
    ).compileComponents();
    const fixture = TestBed.createComponent(ViolationReportComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  async function selectReason(reason: ViolationReportReason) {
    const radioGroup = await loader.getHarness(MatRadioGroupHarness);
    await radioGroup.checkRadioButton({
      label: 'violation-report.reason-' + getViolationReportReasonKey(reason),
    });
  }

  async function enterDescription(description: string) {
    const input = await loader.getHarness(MatInputHarness);
    await input.setValue(description);
  }

  it('sends the selected reason and the entered description', async () => {
    await selectReason(ViolationReportReason.Other);
    await enterDescription('description');
    component.sendReport();
    expect(createGql.mutate).toHaveBeenCalledOnceWith({
      variables: {
        input: {
          targetType: ViolationReportTargetType.Template,
          targetId: 'template-1',
          reason: ViolationReportReason.Other,
          description: 'description',
        },
      },
    });
  });

  it('counts the characters of the description', async () => {
    await enterDescription('description');
    const formField = await loader.getHarness(MatFormFieldHarness);
    expect(await formField.getTextHints()).toEqual(['11 / 500']);
  });

  it('asks for a reason before sending', async () => {
    await enterDescription('description');
    component.sendReport();
    expect(createGql.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'violation-report.please-enter-reason',
      AdvancedSnackBarTypes.WARNING
    );
  });

  it('asks for a description of at most 500 characters', async () => {
    await selectReason(ViolationReportReason.Other);
    const input = await loader.getHarness(MatInputHarness);
    // Harness input ignores the native maxlength, unlike a user typing.
    await input.setValue('x'.repeat(501));
    component.sendReport();
    expect(createGql.mutate).not.toHaveBeenCalled();
    expect(notificationService.showAdvanced).toHaveBeenCalledOnceWith(
      'violation-report.please-enter-description',
      AdvancedSnackBarTypes.WARNING
    );
  });
});
