import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { BaseTemplateService } from '@app/core/services/http/base-template.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { RoomMembershipService } from '@app/core/services/room-membership.service';
import { AddTemplateButtonComponent } from '@app/standalone/add-template-button/add-template-button.component';

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
          provide: RoutingService,
          useClass: MockService,
        },
        {
          provide: RoomMembershipService,
          useClass: MockService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<AddTemplateButtonComponent>;

export const AddTemplateButton: Story = {};
