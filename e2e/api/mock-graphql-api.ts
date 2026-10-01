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
  roundCounts?: Record<number, number>;
  /** Contents whose round ran before, besides the active one. */
  startedPositions?: number[];
}

export function contentId(position: number): string {
  return `content-${position + 1}`;
}

function roundId(position: number, roundNo: number): string {
  return `round-${position + 1}-${roundNo}`;
}

export class MockGraphqlApi {
  private state!: QuestionnaireStateOptions;
  // A round stays started once it ran, even after another content took over.
  private readonly startedPositions = new Set<number>();
  private readonly ws: MockGraphqlWs;
  private installed = false;

  constructor(private readonly page: Page) {
    this.ws = new MockGraphqlWs(page);
  }

  async mockQuestionnaire(options: QuestionnaireStateOptions) {
    this.state = options;
    options.startedPositions?.forEach((position) =>
      this.startedPositions.add(position)
    );
    this.trackStartedRound();
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
    this.trackStartedRound();
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

  private trackStartedRound() {
    const position = this.state.activeContentPosition;
    if (this.state.publishingMode === 'LIVE' && position !== undefined) {
      this.startedPositions.add(position);
    }
  }

  private roundCount(position: number): number {
    return this.state.roundCounts?.[position] ?? 1;
  }

  private contentRound(position: number) {
    const roundNo = this.roundCount(position);
    return {
      __typename: 'Round',
      id: roundId(position, roundNo),
      contentId: contentId(position),
      roundNo,
      closed: this.isRoundClosed(position),
      started:
        this.state.publishingMode !== 'LIVE' ||
        this.startedPositions.has(position),
      // Without a timer, a round is answerable for exactly as long as it is open.
      answerable: !this.isRoundClosed(position),
    };
  }

  private roundsForPosition(position: number) {
    const roundCount = this.roundCount(position);
    return Array.from({ length: roundCount }, (_, i) => {
      const roundNo = i + 1;
      const isCurrentRound = roundNo === roundCount;
      return {
        __typename: 'Round',
        id: roundId(position, roundNo),
        contentId: contentId(position),
        roundNo,
        closed: isCurrentRound ? this.isRoundClosed(position) : true,
        started:
          !isCurrentRound ||
          this.state.publishingMode !== 'LIVE' ||
          this.startedPositions.has(position),
        answerable: isCurrentRound && !this.isRoundClosed(position),
      };
    });
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
    return this.contentRound(position);
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
      answerCount: this.answeredPositions.includes(position) ? 1 : 0,
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
    const match = /^round-(\d+)-\d+$/.exec(String(roundId));
    return Number(match?.[1]) - 1;
  }

  private positionOfContent(contentId: unknown): number {
    const match = /^content-(\d+)$/.exec(String(contentId));
    return Number(match?.[1]) - 1;
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
        const input = variables.input as {
          roundId: string;
          selectedChoiceIndexes: number[];
        };
        const position = this.positionOfRound(input.roundId);
        return {
          createQuestionnaireChoiceAnswer: this.answer(
            position,
            input.selectedChoiceIndexes
          ),
        };
      },
      QuestionnaireRoundsByContentId: (variables) => {
        const position = this.positionOfContent(variables.contentId);
        return {
          questionnaireRoundsByContentId: this.roundsForPosition(position),
        };
      },
      StartQuestionnaireContent: (variables) => {
        const position = this.positionOfContent(variables.contentId);
        this.state.activeContentPosition = position;
        this.state.activeRoundClosed = false;
        this.trackStartedRound();
        return { startQuestionnaireContent: this.questionnaire() };
      },
      StopQuestionnaireContent: () => {
        this.state.activeRoundClosed = true;
        return { stopQuestionnaireContent: this.questionnaire() };
      },
      StartQuestionnaireContentRound: (variables) => {
        const position = this.positionOfContent(variables.contentId);
        this.state.roundCounts = {
          ...this.state.roundCounts,
          [position]: this.roundCount(position) + 1,
        };
        this.state.answeredPositions = this.answeredPositions.filter(
          (answeredPosition) => answeredPosition !== position
        );
        return { startQuestionnaireContentRound: this.contentRound(position) };
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
