import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ViolationReportComponent } from '@app/standalone/_dialogs/violation-report/violation-report.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import {
  CreateViolationReportGql,
  ViolationReportTargetType,
} from '@gql/generated/graphql';

class MockMatDialogRef {}
class MockCreateViolationReportGql {}

export default {
  component: ViolationReportComponent,
  title: 'ViolationReport',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ViolationReportComponent, LoadingButtonComponent],
      providers: [
        {
          provide: CreateViolationReportGql,
          useClass: MockCreateViolationReportGql,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            targetType: ViolationReportTargetType.Template,
            targetId: 'templateId',
          },
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ViolationReportComponent>;

export const ViolationReport: Story = {};
