import { inject } from '@angular/core/testing';

import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MockTranslocoService } from '@testing/test-helpers';
import { TranslocoService } from '@jsverse/transloco';
import { WsConnectorService } from '@app/core/services/websockets/ws-connector.service';
import { Cache, CachingService } from '@app/core/services/util/caching.service';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { FeedbackService } from '@app/core/services/http/feedback.service';
import { RoomStatsService } from '@app/core/services/http/room-stats.service';
import { ContentAnswerService } from '@app/core/services/http/content-answer.service';
import { ContentService } from '@app/core/services/http/content.service';
import { ContentChoice } from '@app/core/models/content-choice';
import { ContentType } from '@app/core/models/content-type.enum';
import { GroupType } from '@app/core/models/content-group';
import { configureTestModule } from '@testing/test.setup';

@Injectable()
class MockWsConnectorService {}

@Injectable()
class MockAuthenticationService {
  getCurrentAuthentication() {}
}

@Injectable()
class MockFeedbackService {}

@Injectable()
class MockRoomStatsService {}

@Injectable()
class MockCachingService {
  getCache() {
    return new Cache();
  }
}

class MockContentAnswerService {}

class MockContentService {}

describe('ContentGroupService', () => {
  beforeEach(() => {
    configureTestModule(
      [],
      [
        ContentGroupService,
        {
          provide: TranslocoService,
          useClass: MockTranslocoService,
        },
        {
          provide: WsConnectorService,
          useClass: MockWsConnectorService,
        },
        {
          provide: AuthenticationService,
          useClass: MockAuthenticationService,
        },
        {
          provide: FeedbackService,
          useClass: MockFeedbackService,
        },
        {
          provide: RoomStatsService,
          useClass: MockRoomStatsService,
        },
        {
          provide: CachingService,
          useClass: MockCachingService,
        },
        {
          provide: ContentAnswerService,
          useClass: MockContentAnswerService,
        },
        {
          provide: ContentService,
          useClass: MockContentService,
        },
      ]
    );
  });

  it('should be created', inject(
    [ContentGroupService],
    (service: ContentGroupService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should check correctly if contents are compatible with group type', inject(
    [ContentGroupService],
    (service: ContentGroupService) => {
      const content = new ContentChoice();
      content.format = ContentType.CHOICE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy(
        'choice content without correct answer option should be compatible with MIXED'
      );
      content.format = ContentType.CHOICE;
      content.correctOptionIndexes = [1];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy(
        'choice content with correct answer option should be compatible with MIXED'
      );
      content.format = ContentType.BINARY;
      content.correctOptionIndexes = [];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy(
        'binary content without correct answer option should be compatible with MIXED'
      );
      content.format = ContentType.BINARY;
      content.correctOptionIndexes = [1];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy(
        'binary content with correct answer option should be compatible with MIXED'
      );
      content.format = ContentType.SCALE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('scale content should be compatible with MIXED');
      content.format = ContentType.TEXT;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('text content should be compatible with MIXED');
      content.format = ContentType.WORDCLOUD;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('wordcloud content should be compatible with MIXED');
      content.format = ContentType.SORT;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('sort content should be compatible with MIXED');
      content.format = ContentType.PRIORITIZATION;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('prioritization content should be compatible with MIXED');
      content.format = ContentType.FLASHCARD;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('flashcards content should be compatible with MIXED');
      content.format = ContentType.SLIDE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.MIXED)
      ).toBeTruthy('slide content should be compatible with MIXED');
      content.format = ContentType.CHOICE;
      content.correctOptionIndexes = [];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.SURVEY)
      ).toBeTruthy(
        'choice content without correct answer option should be compatible with SURVEY'
      );
      content.format = ContentType.CHOICE;
      content.correctOptionIndexes = [1];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.QUIZ)
      ).toBeTruthy(
        'choice content with correct answer option should be compatible with QUIZ'
      );
      content.format = ContentType.SLIDE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.SURVEY)
      ).toBeTruthy('slide content should be compatible with SURVEY');
      content.format = ContentType.SLIDE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.QUIZ)
      ).toBeTruthy('slide content should be compatible with QUIZ');
      content.format = ContentType.CHOICE;
      content.correctOptionIndexes = [];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.QUIZ)
      ).toBeFalsy(
        'choice content without correct answer option should not be compatible with QUIZ'
      );
      content.format = ContentType.CHOICE;
      content.correctOptionIndexes = [1];
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.SURVEY)
      ).toBeFalsy(
        'choice content with correct answer option should not be compatible with SURVEY'
      );
      content.format = ContentType.FLASHCARD;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.SURVEY)
      ).toBeFalsy('flashcard content should not be compatible with SURVEY');
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.QUIZ)
      ).toBeFalsy('flashcard content should not be compatible with QUIZ');
      content.format = ContentType.SLIDE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.SURVEY)
      ).toBeTruthy('slide content should be compatible with SURVEY');
      content.format = ContentType.CHOICE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.FLASHCARDS)
      ).toBeFalsy('choice content should not be compatible with FLASHCARDS');
      content.format = ContentType.SCALE;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.FLASHCARDS)
      ).toBeFalsy('scale content should not be compatible with FLASHCARDS');
      content.format = ContentType.WORDCLOUD;
      expect(
        service.isContentCompatibleWithGroupType(content, GroupType.FLASHCARDS)
      ).toBeFalsy('wordcloud content should not be compatible with FLASHCARDS');
    }
  ));
});
