import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';

import { TranslocoRootModule } from '@app/transloco-root.module';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';
import { DialogService } from '@app/core/services/util/dialog.service';

class MockService {}

export default {
  component: AddTemplateButtonComponent,
  title: 'AddTemplateButton',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [AddTemplateButtonComponent, LoadingButtonComponent],
      providers: [
        {
          provide: BaseTemplateService,
          useClass: MockService,
        },
        {
          provide: NotificationService,
          useClass: MockService,
        },
        {
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
        {
          provide: DialogService,
          useClass: MockService,
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

type Story = StoryObj<AddTemplateButtonComponent>;

export const AddTemplateButton: Story = {};
