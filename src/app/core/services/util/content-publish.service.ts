import { Injectable } from '@angular/core';
import {
  Questionnaire,
  QuestionnairePublishingMode,
} from '@gql/generated/graphql';

@Injectable({ providedIn: 'root' })
export class ContentPublishService {
  isIndexPublished(questionnaire: Questionnaire, index: number): boolean {
    if (this.isGroupLocked(questionnaire)) {
      return false;
    }
    const publishingIndex = questionnaire.publishedUpToContent?.position;
    switch (questionnaire.publishingMode) {
      case QuestionnairePublishingMode.All:
        return true;
      case QuestionnairePublishingMode.UpTo:
      case QuestionnairePublishingMode.Live:
        return publishingIndex != null && publishingIndex >= index;
      default:
        return false;
    }
  }

  isGroupLocked(questionnaire: Questionnaire): boolean {
    return !questionnaire.published;
  }

  hasSpecificPublishing(questionnaire: Questionnaire): boolean {
    return this.isRangePublished(questionnaire);
  }

  isRangePublished(questionnaire: Questionnaire): boolean {
    return (
      !this.isGroupLocked(questionnaire) &&
      [
        QuestionnairePublishingMode.UpTo,
        QuestionnairePublishingMode.Live,
      ].includes(questionnaire.publishingMode)
    );
  }

  isLive(questionnaire: Questionnaire): boolean {
    return questionnaire.publishingMode === QuestionnairePublishingMode.Live;
  }
}
