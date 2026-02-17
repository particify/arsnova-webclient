import { ErrorClassification } from '@gql/helper/handle-operation-error';

export class GraphqlError {
  type: string;
  payload: {
    errorNumber: number;
    classification?: ErrorClassification;
  };

  constructor(errorNumber: number, classification?: ErrorClassification) {
    this.type = 'GraphqlError';
    this.payload = { errorNumber, classification };
  }
}
