import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { TranslocoModule } from '@ngneat/transloco';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConsentService } from '@app/core/services/util/consent.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

class MockConsentService {}

export default {
  component: FooterComponent,
  title: 'Footer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [
        TranslocoModule,
        FooterComponent,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: ConsentService,
          useClass: MockConsentService,
        },
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<FooterComponent>;

export const Footer: Story = {};
