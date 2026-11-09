import { AnswerOption } from '@gql/generated/graphql';

export class SelectableOption {
  option: AnswerOption;
  checked: boolean;

  constructor(option: AnswerOption, checked: boolean) {
    this.option = option;
    this.checked = checked;
  }
}
