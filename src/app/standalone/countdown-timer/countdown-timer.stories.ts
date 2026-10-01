import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CountdownTimerComponent } from '@app/standalone/countdown-timer/countdown-timer.component';

export default {
  component: CountdownTimerComponent,
  title: 'CountdownTimer',
  excludeStories: /.*Data$/,
  decorators: [
    moduleMetadata({
      imports: [CountdownTimerComponent],
    }),
  ],
} as Meta;

type Story = StoryObj<CountdownTimerComponent>;

/** Counts down from the moment the story renders, not from when it was loaded. */
function startingNow(seconds: number): Story['render'] {
  return (args) => ({
    props: { ...args, endDate: new Date(Date.now() + seconds * 1000) },
  });
}

export const Timer10: Story = {
  args: {
    duration: 10,
    showIcon: true,
  },
  render: startingNow(10),
};

export const Timer60: Story = {
  args: {
    duration: 60,
    showIcon: true,
  },
  render: startingNow(60),
};

export const Timer90: Story = {
  args: {
    duration: 90,
    showIcon: true,
  },
  render: startingNow(90),
};

export const RunningOut: Story = {
  args: {
    duration: 60,
    showIcon: true,
  },
  render: startingNow(5),
};

export const Presentation: Story = {
  args: {
    duration: 60,
    showIcon: true,
    layout: 'column-reverse',
    bigFontSize: true,
  },
  render: startingNow(60),
};

export const Participant: Story = {
  args: {
    duration: 60,
    borderRadius: 3,
  },
  render: startingNow(60),
};

export const ContentList: Story = {
  args: {
    duration: 60,
    showProgressBar: false,
    fontSize: '12px',
  },
  render: startingNow(60),
};
