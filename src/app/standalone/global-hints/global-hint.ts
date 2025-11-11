export enum GlobalHintType {
  INFO = 'info',
  WARNING = 'warning',
  CUSTOM = 'custom',
}

export interface GlobalHint {
  id: string;
  type: GlobalHintType;
  message: string;
  icon?: string;
  actionLabel?: string;
  action?: () => void;
  dismissible?: boolean;
}
