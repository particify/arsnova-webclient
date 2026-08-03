import { Page } from '@playwright/test';
import { MockGraphqlWs } from '@e2e/api/mock-graphql-ws';

export const MOCK_QUESTIONNAIRE_ID = '49ca70a9-83f4-4bd8-a81a-000000000001';

export interface QuestionnaireStateOptions {
  publishingMode: 'ALL' | 'UP_TO' | 'LIVE';
  contentCount?: number;
  publishedUpToPosition?: number;
  activeContentPosition?: number;
  activeRoundClosed?: boolean;
  answeredPositions?: number[];
}

export function contentId(position: number): string {
  return `content-${position + 1}`;
}

function roundId(position: number): string {
  return `round-${position + 1}`;
}

export class MockGraphqlApi {
  private state!: QuestionnaireStateOptions;
  private readonly ws: MockGraphqlWs;
  private installed = false;

  constructor(private readonly page: Page) {
    this.ws = new MockGraphqlWs(page);
  }

  async mockQuestionnaire(options: QuestionnaireStateOptions) {
    this.state = options;
    if (this.installed) {
      return;
    }
    this.installed = true;
    await this.ws.install();
    await this.page.route('*/**/graphql', async (route) => {
      const body = route.request().postDataJSON();
      const handler = body?.operationName
        ? this.handlers()[body.operationName]
        : undefined;
      if (!handler) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        json: { data: handler(body.variables ?? {}) },
      });
    });
  }

  async update(patch: Partial<QuestionnaireStateOptions>) {
    this.state = { ...this.state, ...patch };
    await this.ws.push('QuestionnaireUpdated', {
      questionnaireUpdated: this.questionnaire(),
    });
  }

  private get contentCount(): number {
    return this.state.contentCount ?? 3;
  }

  private get answeredPositions(): number[] {
    return this.state.answeredPositions ?? [];
  }

  private get publishedUpToPosition(): number | undefined {
    return this.state.publishingMode === 'ALL'
      ? this.contentCount - 1
      : this.state.publishedUpToPosition;
  }

  private get publishedPositions(): number[] {
    const publishedUpToPosition = this.publishedUpToPosition;
    return publishedUpToPosition === undefined
      ? []
      : Array.from(Array(publishedUpToPosition + 1).keys());
  }

  private contentRound(position: number) {
    return {
      __typename: 'Round',
      id: roundId(position),
      roundNo: 1,
      closed: this.isRoundClosed(position),
    };
  }

  private isRoundClosed(position: number): boolean {
    if (this.state.publishingMode !== 'LIVE') {
      return false;
    }
    return position === this.state.activeContentPosition
      ? !!this.state.activeRoundClosed
      : true;
  }

  private activeRound() {
    const position = this.state.activeContentPosition;
    if (this.state.publishingMode !== 'LIVE' || position === undefined) {
      return null;
    }
    return {
      __typename: 'Round',
      id: roundId(position),
      contentId: contentId(position),
      roundNo: 1,
      closed: !!this.state.activeRoundClosed,
    };
  }

  private questionnaire() {
    const publishedUpToPosition = this.publishedUpToPosition;
    return {
      __typename: 'Questionnaire',
      id: MOCK_QUESTIONNAIRE_ID,
      name: 'My questionnaire',
      type: 'SURVEY',
      published: true,
      publishingMode: this.state.publishingMode,
      publishedUpToContent:
        publishedUpToPosition === undefined
          ? null
          : {
              __typename: 'Content',
              id: contentId(publishedUpToPosition),
              position: publishedUpToPosition,
            },
      activeRound: this.activeRound(),
      statisticsPublished: true,
      correctOptionsPublished: false,
      leaderboardEnabled: false,
      contentCount: this.contentCount,
    };
  }

  private contentNode(position: number) {
    return {
      __typename: 'Content',
      id: contentId(position),
      body: `Content ${position + 1}`,
      bodyRendered: `<p>Content ${position + 1}</p>`,
      activeRound: this.contentRound(position),
      formatData: {
        __typename: 'ChoiceContentFormatData',
        format: 'CHOICE',
        options: [
          {
            __typename: 'AnswerOption',
            label: 'Option A',
            labelRendered: null,
          },
          {
            __typename: 'AnswerOption',
            label: 'Option B',
            labelRendered: null,
          },
        ],
        correctOptionIndexes: null,
        multiple: false,
      },
      duration: null,
      abstentionsAllowed: true,
      hasCorrectAnswer: false,
      weight: null,
      answerCount: 0,
      abstentionCount: 0,
      correctAnswerCount: null,
      position,
    };
  }

  private answer(position: number, selectedChoiceIndexes: number[]) {
    return {
      __typename: 'Answer',
      id: `answer-${position + 1}`,
      result: 'NEUTRAL',
      formatData: {
        __typename: 'ChoiceAnswerFormatData',
        format: 'CHOICE',
        selectedChoiceIndexes,
      },
    };
  }

  private positionOfRound(roundId: unknown): number {
    return Number(String(roundId).replace('round-', '')) - 1;
  }

  private handlers(): Record<
    string,
    (variables: Record<string, unknown>) => unknown
  > {
    return {
      QuestionnaireById: () => ({ questionnaireById: this.questionnaire() }),
      QuestionnairePublishedContentsByQuestionnaireId: () => ({
        questionnairePublishedContentsByQuestionnaireId: {
          __typename: 'ContentConnection',
          edges: this.publishedPositions.map((position) => ({
            __typename: 'ContentEdge',
            node: this.contentNode(position),
          })),
        },
      }),
      QuestionnaireContentAnswerResultsByQuestionnaireId: () => ({
        questionnaireContentAnswerResultsByQuestionnaireId:
          this.publishedPositions.map((position) => ({
            __typename: 'ContentAnswerResult',
            contentId: contentId(position),
            result: this.answeredPositions.includes(position)
              ? 'NEUTRAL'
              : 'UNANSWERED',
            duration: null,
          })),
      }),
      QuestionnaireAnswerByRoundId: (variables) => {
        const position = this.positionOfRound(variables.roundId);
        return {
          questionnaireAnswerByRoundId: this.answeredPositions.includes(
            position
          )
            ? this.answer(position, [0])
            : null,
        };
      },
      CreateQuestionnaireChoiceAnswer: (variables) => {
        const position = this.positionOfRound(variables.roundId);
        return {
          createQuestionnaireChoiceAnswer: this.answer(
            position,
            variables.selectedChoiceIndexes as number[]
          ),
        };
      },
      CurrentUserWithSettings: () => ({
        currentUser: {
          __typename: 'User',
          id: 'user-1',
          verified: false,
          displayId: null,
          displayName: null,
          mailAddress: null,
          unverifiedMailAddress: null,
          uiSettings: {
            __typename: 'UserUiSettings',
            contentAnswersDirectlyBelowChart: false,
            contentVisualizationUnitPercent: true,
            showContentResultsDirectly: false,
            rotateWordcloudItems: true,
          },
        },
      }),
    };
  }
}
