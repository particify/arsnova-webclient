export class AnswerOption {
  label: string;
  renderedLabel?: string;

  constructor(label: string) {
    this.label = label;
  }
}

export function toAnswerOption(option: {
  label: string;
  labelRendered?: string | null;
}): AnswerOption {
  return {
    label: option.label,
    renderedLabel: option.labelRendered ?? undefined,
  };
}
