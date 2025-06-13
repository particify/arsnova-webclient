import { LiveFeedbackType } from './live-feedback-type.enum';

export interface RoomSettings {
  id: string;
  roomId: string;
  surveyEnabled: boolean;
  surveyType: LiveFeedbackType;
  focusModeEnabled: boolean;
  commentThresholdEnabled: boolean;
  commentThreshold: number;
  commentTags?: string[];
}
