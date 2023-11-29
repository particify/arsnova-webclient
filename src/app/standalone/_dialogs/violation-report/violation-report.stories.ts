import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ViolationReportComponent } from '@app/standalone/_dialogs/violation-report/violation-report.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { ViolationReportService } from '@app/core/services/http/violation-report.service';
import { NotificationService } from '@app/core/services/util/notification.service';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';
import { Room } from '@app/core/models/room';

class MockMatDialogRef {}
class MockService {}

class MockViolationReportService {
  getReasonString(reason: string): string {
    return reason.toLowerCase().replaceAll(/_/g, '-');
  }

  getTargetTypeString(targetType: string): string {
    let type: string;
    switch (targetType) {
      case ContentGroupTemplate.name:
        type = 'template';
        break;
      case Room.name:
        type = 'room';
        break;
      default:
        type = 'content';
    }
    return type;
  }
}

export default {
  component: ViolationReportComponent,
  title: 'ViolationReport',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [ViolationReportComponent, LoadingButtonComponent],
      providers: [
        {
          provide: ViolationReportService,
          useClass: MockViolationReportService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            targetType: 'ContentGroupTemplate',
            targetId: 'templateId',
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(TranslocoRootModule),
        importProvidersFrom(HttpClientModule),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<ViolationReportComponent>;

export const ViolationReport: Story = {};
