import { AnswerOption } from '@app/core/models/answer-option';
import { AnswerResponse } from '@app/core/models/answer-response';
import {
  AnswerResult,
  AnswerResultOverview,
  AnswerResultType,
} from '@app/core/models/answer-result';
import { AnswerStatistics } from '@app/core/models/answer-statistics';
import { ChoiceAnswer } from '@app/core/models/choice-answer';
import { CommentSettings } from '@app/core/models/comment-settings';
import { Content } from '@app/core/models/content';
import { ContentChoice } from '@app/core/models/content-choice';
import {
  ContentGroup,
  GroupType,
  PublishingMode,
} from '@app/core/models/content-group';
import { ContentScale } from '@app/core/models/content-scale';
import { ContentShortAnswer } from '@app/core/models/content-short-answer';
import { ContentState } from '@app/core/models/content-state';
import { ContentType } from '@app/core/models/content-type.enum';
import { LikertScaleTemplate } from '@app/core/models/likert-scale-template.enum';
import { Membership } from '@app/core/models/membership';
import { Room } from '@app/core/models/room';
import { RoomStats } from '@app/core/models/room-stats';
import {
  RoundStatistics,
  TextRoundStatistics,
} from '@app/core/models/round-statistics';
import { ShortAnswerAnswer } from '@app/core/models/short-answer-answer';
import { TextAnswer } from '@app/core/models/text-answer';
import { UserRole } from '@app/core/models/user-roles.enum';
import { Page } from '@playwright/test';

export class MockApi {
  constructor(public readonly page: Page) {}

  async mockMembershipParticipant() {
    await this.page.route('*/**/_view/membership/by-user/**', async (route) => {
      const membership = new Membership();
      membership.roomId = 'roomId';
      membership.roles = [UserRole.PARTICIPANT];
      membership.roomShortId = '12345678';
      await route.fulfill({ status: 200, json: [membership] });
    });
  }

  async mockRoomSummaryParticipant() {
    await this.page.route(
      '*/**/_view/room/summary/?ids=roomId',
      async (route) => {
        const membership = new Membership();
        membership.roomId = 'roomId';
        membership.roles = [UserRole.PARTICIPANT];
        membership.roomShortId = '12345678';
        await route.fulfill({ status: 200, json: membership });
      }
    );
  }

  async mockRequestMembership() {
    await this.page.route('*/**/room/~12345678/request-membership', (route) => {
      const room = new Room('ownerId', '12345678', '', 'My room');
      room.id = 'roomId';
      route.fulfill({
        status: 200,
        json: room,
      });
    });
  }

  async mockRoomWithShortId(lang?: string) {
    await this.page.route('*/**/room/~12345678', async (route) => {
      const room = new Room('ownerId', '12345678', '', 'My room');
      room.id = 'roomId';
      room.settings = { feedbackLocked: true };
      room.language = lang;
      await route.fulfill({ status: 200, json: room });
    });
  }

  async mockRoomSettings() {
    await this.page.route('*/**/room/roomId/settings/roomId', async (route) => {
      const settings = new CommentSettings('roomId');
      await route.fulfill({ status: 200, json: settings });
    });
  }

  async mockContentGroup(
    name: string,
    contentIds: string[],
    groupType = GroupType.MIXED,
    statisticsPublished = true,
    correctOptionsPublished = true,
    published = true,
    publishingMode = PublishingMode.ALL,
    publishingIndex = 0,
    leaderboardEnabled = true
  ) {
    const group = new ContentGroup(
      'roomId',
      name,
      contentIds,
      statisticsPublished,
      correctOptionsPublished,
      published,
      publishingMode,
      publishingIndex,
      groupType,
      leaderboardEnabled
    );
    group.id = 'groupId';
    await this.page.route(
      '*/**/room/roomId/contentgroup/groupId',
      async (route) => {
        await route.fulfill({ status: 200, json: group });
      }
    );
  }

  async mockFocusEvent() {
    await this.page.route('*/**/room/roomId/focus-event', async (route) => {
      const settings = new CommentSettings('roomId');
      await route.fulfill({ status: 200, json: settings });
    });
  }

  async mockRoomStats(name: string, contentCount: number, type: GroupType) {
    await this.page.route('*/**/room/roomId/stats', async (route) => {
      const stats = new RoomStats(
        [
          {
            id: 'groupId',
            groupName: name,
            contentCount: contentCount,
            groupType: type,
          },
        ],
        0,
        2,
        0,
        0
      );
      await route.fulfill({ status: 200, json: stats });
    });
  }

  async mockAliasGeneration(alias: string) {
    await this.page.route(
      '*/**/room/roomId/user-alias/-/generate',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: { alias: alias, seed: alias.length % 8 },
        });
      }
    );
  }

  async mockUserAlias() {
    await this.page.route('*/**/room/roomId/user-alias/', async (route) => {
      await route.fulfill({
        status: 200,
        json: { id: 'aliasId', seed: 1 },
      });
    });
  }

  async mockGroupStats(
    correctAnswerCount: number,
    scorableContentCount: number,
    archievedScore: number,
    maxScore: number,
    answerResults: AnswerResult[]
  ) {
    const stats = new AnswerResultOverview();
    stats.correctAnswerCount = correctAnswerCount;
    stats.scorableContentCount = scorableContentCount;
    stats.achievedScore = archievedScore;
    stats.maxScore = maxScore;
    stats.answerResults = answerResults;
    await this.page.route(
      '*/**/room/roomId/contentgroup/groupId/stats/user/**',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: stats,
        });
      }
    );
  }

  async mockShortAnswerContentStats(
    contentId: string,
    texts: string[],
    independentCounts: number[],
    answerCount: number,
    abstentionCount = 0,
    round = 1
  ) {
    await this.page.route(
      `*/**/room/roomId/content/${contentId}/stats`,
      async (route) => {
        const stats = new AnswerStatistics();
        stats.roundStatistics = [
          new TextRoundStatistics(
            round,
            independentCounts,
            [],
            abstentionCount,
            answerCount,
            texts
          ),
        ];
        await route.fulfill({
          status: 200,
          json: stats,
        });
      }
    );
  }

  async mockAttributions() {
    await this.page.route(
      '*/**/room/roomId/contentgroup/groupId/attributions',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: [],
        });
      }
    );
  }

  async mockContentsQuiz() {
    await this.page.route(
      '*/**/room/roomId/content/?ids=content1,content2',
      async (route) => {
        const content1 = new ContentChoice(
          'roomId',
          undefined,
          'My choice content',
          [],
          [
            new AnswerOption('a'),
            new AnswerOption('b'),
            new AnswerOption('c'),
            new AnswerOption('d'),
          ],
          [1],
          false,
          ContentType.CHOICE
        );
        content1.id = 'content1';
        content1.renderedBody = '<p>My choice content</p>';
        content1.state = new ContentState(1, undefined, true);
        const content2 = new ContentShortAnswer(
          'roomId',
          undefined,
          'My short answer content',
          [],
          ['abc'],
          ContentType.SHORT_ANSWER
        );
        content2.id = 'content2';
        content2.renderedBody = '<p>My short answer content</p>';
        content2.state = new ContentState(1, undefined, true);
        const contents = [content1, content2];
        await route.fulfill({
          status: 200,
          json: contents,
        });
      }
    );
  }

  async mockContentsSurvey() {
    await this.page.route(
      '*/**/room/roomId/content/?ids=content1,content2,content3',
      async (route) => {
        const content1 = new ContentScale(LikertScaleTemplate.AGREEMENT, 5);
        content1.id = 'content1';
        content1.renderedBody = '<p>My likert content</p>';
        content1.state = new ContentState(1, undefined, true);
        const content2 = new Content(
          'roomId',
          undefined,
          'My open question content',
          [],
          ContentType.TEXT
        );
        content2.id = 'content2';
        content2.renderedBody = '<p>My open question content</p>';
        content2.state = new ContentState(1, undefined, true);
        const content3 = new ContentChoice(
          'roomId',
          undefined,
          'My choice content',
          undefined,
          [new AnswerOption('answer 1'), new AnswerOption('answer 2')]
        );
        content3.id = 'content3';
        content3.renderedBody = '<p>My choice content</p>';
        content3.state = new ContentState(1, undefined, true);
        const contents = [content1, content2, content3];
        await route.fulfill({
          status: 200,
          json: contents,
        });
      }
    );
  }

  async mockRoomAnswers() {
    await this.page.route('*/**/room/roomId/answer/find', async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });
  }

  async mockAnswers() {
    await this.page.route('*/**/answer/find', async (route) => {
      await route.fulfill({
        status: 200,
        json: [],
      });
    });
  }

  async mockContentAnswering() {
    await this.page.route('*/**/**/answer/', async (route, request) => {
      const postBody = request.postDataJSON();
      let answer;
      switch (postBody.format) {
        case ContentType.CHOICE:
          answer = new ChoiceAnswer(
            postBody.id,
            postBody.round,
            postBody.format
          );
          answer.selectedChoiceIndexes = postBody.selectedChoiceIndexes;
          break;
        case ContentType.SHORT_ANSWER:
          answer = new ShortAnswerAnswer(
            postBody.id,
            postBody.round,
            postBody.text
          );
          break;
        case ContentType.SCALE:
          answer = new ChoiceAnswer(
            postBody.id,
            postBody.round,
            postBody.format
          );
          answer.selectedChoiceIndexes = postBody.selectedChoiceIndexes;
          break;
        case ContentType.TEXT:
          answer = new TextAnswer(postBody.id, postBody.round, postBody.body);
          break;
      }
      await route.fulfill({
        status: 201,
        json: answer,
      });
    });
  }

  async mockCheckResult() {
    await this.page.route(
      '*/**/room/roomId/answer/check-result',
      async (route, request) => {
        const postBody = request.postDataJSON();
        const answer = new ChoiceAnswer(
          postBody.id,
          postBody.round,
          postBody.format
        );
        const answerResult = {
          contentId: postBody.id,
          achievedPoints: 500,
          maxPoints: 500,
          duration: 0,
          state: AnswerResultType.CORRECT,
        };
        const answerResponse: AnswerResponse<string[]> = {
          answer: answer,
          answerResult: answerResult,
          correctnessCriteria: ['abc'],
        };
        await route.fulfill({
          status: 200,
          json: answerResponse,
        });
      }
    );
  }

  async mockCorrectChoiceIndexes() {
    await this.page.route(
      '*/**/room/roomId/content/content1/correct-choice-indexes',
      async (route) => {
        await route.fulfill({
          status: 200,
          json: [1],
        });
      }
    );
  }

  async mockGroupLeaderboard(score: number, alias: string) {
    await this.page.route(
      '*/**/room/roomId/contentgroup/groupId/leaderboard',
      async (route) => {
        const userAlias = { id: 'aliasId', alias: alias, seed: 1 };
        await route.fulfill({
          status: 200,
          json: [{ userAlias: userAlias, score: score }],
        });
      }
    );
  }
}
