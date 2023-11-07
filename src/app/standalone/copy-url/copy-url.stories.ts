import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { NotificationService } from '@app/core/services/util/notification.service';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TranslocoRootModule } from '@app/transloco-root.module';

class MockNotificationService {}

export default {
  component: CopyUrlComponent,
  title: 'CopyUrl',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CopyUrlComponent],
      providers: [
        {
          provide: NotificationService,
          useClass: MockNotificationService,
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

type Story = StoryObj<CopyUrlComponent>;

export const CopyUrl: Story = {
  args: {
    url: 'https://path-to-whatever',
  },
};
