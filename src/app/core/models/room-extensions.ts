import { LiveFeedbackType } from './live-feedback-type.enum';

export interface CommentExtensions {
  enableThreshold?: boolean;
  commentThreshold?: number;
  enableTags?: boolean;
  tags?: string[];
}

export interface RoomExtensions {
  feedback?: {
    type?: LiveFeedbackType;
  };
  comments?: CommentExtensions;
}
