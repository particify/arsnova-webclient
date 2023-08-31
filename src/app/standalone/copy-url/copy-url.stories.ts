import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { NotificationService } from '@app/core/services/util/notification.service';

class MockNotificationService {}

export default {
  component: CopyUrlComponent,
  title: 'CopyUrl',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [TranslocoModule, CopyUrlComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<CopyUrlComponent>;

export const CopyUrl: Story = {
  args: {
    url: 'https://path-to-whatever',
  },
};
