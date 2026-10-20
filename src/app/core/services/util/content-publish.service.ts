import { Injectable } from '@angular/core';
import {
  Questionnaire,
  QuestionnairePublishingMode,
} from '@gql/generated/graphql';

@Injectable({ providedIn: 'root' })
export class ContentPublishService {
  isIndexPublished(
    published: boolean,
    publishingMode: QuestionnairePublishingMode,
    index: number,
    publishingIndex?: number
  ): boolean {
    if (!published) {
      return false;
    }
    switch (publishingMode) {
      case QuestionnairePublishingMode.All:
        return true;
      case QuestionnairePublishingMode.UpTo:
      case QuestionnairePublishingMode.Live:
        return publishingIndex != null && publishingIndex >= index;
      default:
        return false;
    }
  }

  isLive(questionnaire: Questionnaire): boolean {
    return questionnaire.publishingMode === QuestionnairePublishingMode.Live;
  }
}
