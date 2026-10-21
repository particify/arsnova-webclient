/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from './schema-types';

import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export * from './schema-types';
export type AdminUserDetailsFragment = {
  __typename: 'AdminUser';
  id: string;
  username: string | null;
  displayId: string | null;
  mailAddress: string | null;
  unverifiedMailAddress: string | null;
  language: string | null;
  verificationCode: number | null;
  verificationErrors: number | null;
  verificationExpiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastActivityAt: string | null;
  uiSettings: {
    __typename: 'UserUiSettings';
    contentAnswersDirectlyBelowChart: boolean | null;
    contentVisualizationUnitPercent: boolean | null;
    showContentResultsDirectly: boolean | null;
    rotateWordcloudItems: boolean | null;
  } | null;
};

export type AdminRoomDetailsFragment = {
  __typename: 'AdminRoom';
  id: string;
  shortId: string;
  name: string;
  description: string | null;
  descriptionRendered: string | null;
  language: string | null;
  focusModeEnabled: boolean | null;
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type AdminUserByIdQueryVariables = Exact<{
  id: string;
}>;

export type AdminUserByIdQuery = {
  adminUserById: {
    __typename: 'AdminUser';
    id: string;
    username: string | null;
    displayId: string | null;
    mailAddress: string | null;
    unverifiedMailAddress: string | null;
    language: string | null;
    verificationCode: number | null;
    verificationErrors: number | null;
    verificationExpiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    lastActivityAt: string | null;
    uiSettings: {
      __typename: 'UserUiSettings';
      contentAnswersDirectlyBelowChart: boolean | null;
      contentVisualizationUnitPercent: boolean | null;
      showContentResultsDirectly: boolean | null;
      rotateWordcloudItems: boolean | null;
    } | null;
  } | null;
};

export type AdminUsersQueryVariables = Exact<{
  search?: string | null;
  exactSearchMode?: boolean | null;
  cursor?: string | null;
}>;

export type AdminUsersQuery = {
  adminUsers: {
    __typename: 'AdminUserConnection';
    edges: Array<{
      __typename: 'AdminUserEdge';
      cursor: string;
      node: {
        __typename: 'AdminUser';
        id: string;
        username: string | null;
        displayId: string | null;
        mailAddress: string | null;
        unverifiedMailAddress: string | null;
        language: string | null;
        verificationCode: number | null;
        verificationErrors: number | null;
        verificationExpiresAt: string | null;
        createdAt: string | null;
        updatedAt: string | null;
        lastActivityAt: string | null;
        uiSettings: {
          __typename: 'UserUiSettings';
          contentAnswersDirectlyBelowChart: boolean | null;
          contentVisualizationUnitPercent: boolean | null;
          showContentResultsDirectly: boolean | null;
          rotateWordcloudItems: boolean | null;
        } | null;
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type AdminDeleteUserByIdMutationVariables = Exact<{
  id: string;
}>;

export type AdminDeleteUserByIdMutation = { adminDeleteUserById: string };

export type AdminCreateUserMutationVariables = Exact<{
  mailAddress: string;
}>;

export type AdminCreateUserMutation = {
  adminCreateUser: {
    __typename: 'AdminUser';
    id: string;
    username: string | null;
    displayId: string | null;
    mailAddress: string | null;
    unverifiedMailAddress: string | null;
    language: string | null;
    verificationCode: number | null;
    verificationErrors: number | null;
    verificationExpiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    lastActivityAt: string | null;
    uiSettings: {
      __typename: 'UserUiSettings';
      contentAnswersDirectlyBelowChart: boolean | null;
      contentVisualizationUnitPercent: boolean | null;
      showContentResultsDirectly: boolean | null;
      rotateWordcloudItems: boolean | null;
    } | null;
  };
};

export type AdminVerifyUserByIdMutationVariables = Exact<{
  id: string;
}>;

export type AdminVerifyUserByIdMutation = {
  adminVerifyUserById: {
    __typename: 'AdminUser';
    id: string;
    username: string | null;
    displayId: string | null;
    mailAddress: string | null;
    unverifiedMailAddress: string | null;
    language: string | null;
    verificationCode: number | null;
    verificationErrors: number | null;
    verificationExpiresAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    lastActivityAt: string | null;
    uiSettings: {
      __typename: 'UserUiSettings';
      contentAnswersDirectlyBelowChart: boolean | null;
      contentVisualizationUnitPercent: boolean | null;
      showContentResultsDirectly: boolean | null;
      rotateWordcloudItems: boolean | null;
    } | null;
  };
};

export type AdminRoomByIdQueryVariables = Exact<{
  id: string;
}>;

export type AdminRoomByIdQuery = {
  adminRoomById: {
    __typename: 'AdminRoom';
    id: string;
    shortId: string;
    name: string;
    description: string | null;
    descriptionRendered: string | null;
    language: string | null;
    focusModeEnabled: boolean | null;
    createdBy: string | null;
    createdAt: string | null;
    updatedBy: string | null;
    updatedAt: string | null;
  } | null;
};

export type AdminRoomsQueryVariables = Exact<{
  search?: string | null;
  cursor?: string | null;
}>;

export type AdminRoomsQuery = {
  adminRooms: {
    __typename: 'AdminRoomConnection';
    edges: Array<{
      __typename: 'AdminRoomEdge';
      cursor: string;
      node: {
        __typename: 'AdminRoom';
        id: string;
        shortId: string;
        name: string;
        description: string | null;
        descriptionRendered: string | null;
        language: string | null;
        focusModeEnabled: boolean | null;
        createdBy: string | null;
        createdAt: string | null;
        updatedBy: string | null;
        updatedAt: string | null;
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type AdminRoomManagingMembersByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type AdminRoomManagingMembersByRoomIdQuery = {
  adminRoomManagingMembersByRoomId: Array<{
    __typename: 'RoomMember';
    role: Types.RoomRole | null;
    user: {
      __typename: 'User';
      id: string;
      displayId: string | null;
      displayName: string | null;
      verified: boolean;
    };
  }> | null;
};

export type AdminDeleteRoomByIdMutationVariables = Exact<{
  id: string;
}>;

export type AdminDeleteRoomByIdMutation = { adminDeleteRoomById: string };

export type AdminTransferRoomMutationVariables = Exact<{
  roomId: string;
  userId: string;
}>;

export type AdminTransferRoomMutation = {
  adminTransferRoom: {
    __typename: 'AdminRoom';
    id: string;
    shortId: string;
    name: string;
    description: string | null;
    descriptionRendered: string | null;
    language: string | null;
    focusModeEnabled: boolean | null;
    createdBy: string | null;
    createdAt: string | null;
    updatedBy: string | null;
    updatedAt: string | null;
  };
};

export type AdminStatsQueryVariables = Exact<{ [key: string]: never }>;

export type AdminStatsQuery = {
  adminUserStats: {
    __typename: 'AdminUserStats';
    totalCount: number;
    verifiedCount: number;
    pendingCount: number;
  } | null;
  adminRoomStats: {
    __typename: 'AdminRoomStats';
    totalCount: number;
    membershipCount: number;
    managingUserCount: number;
    participantCount: number;
  } | null;
  adminAnnouncementStats: {
    __typename: 'AdminAnnouncementStats';
    totalCount: number;
  } | null;
  adminQnaStats: { __typename: 'AdminQnaStats'; postCount: number } | null;
};

export type AdminRoomActivityStatsQueryVariables = Exact<{
  from: string;
  to: string;
}>;

export type AdminRoomActivityStatsQuery = {
  adminRoomActivityStats: {
    __typename: 'AdminRoomActivityStats';
    managingUserCount: number;
    participantCount: number;
    roomCount: number;
  };
};

export type ActiveRoomStatsQueryVariables = Exact<{
  minMemberCount?: number | null;
  activityWindowMinutes?: number | null;
}>;

export type ActiveRoomStatsQuery = {
  adminActiveRoomStats: {
    __typename: 'AdminActiveRoomStats';
    count: number;
    minMemberCount: number;
    activityWindowMinutes: number;
  } | null;
};

export type AdminUserCountQueryVariables = Exact<{ [key: string]: never }>;

export type AdminUserCountQuery = {
  adminUserStats: {
    __typename: 'AdminUserStats';
    verifiedCount: number;
    pendingCount: number;
  } | null;
};

export type AdminRoomCountQueryVariables = Exact<{ [key: string]: never }>;

export type AdminRoomCountQuery = {
  adminRoomStats: { __typename: 'AdminRoomStats'; totalCount: number } | null;
};

export type AdminRoomMembershipsByUserIdQueryVariables = Exact<{
  userId: string;
}>;

export type AdminRoomMembershipsByUserIdQuery = {
  adminRoomMembershipsByUserId: {
    __typename: 'RoomMembershipConnection';
    edges: Array<{
      __typename: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename: 'RoomMembership';
        role: Types.RoomRole;
        room: {
          __typename: 'Room';
          id: string;
          shortId: string;
          name: string;
          description: string | null;
          descriptionRendered: string | null;
          language: string | null;
          focusModeEnabled: boolean | null;
          stats: {
            __typename: 'RoomStats';
            id: string;
            activeMemberCount: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type AnnouncementsMetaForCurrentUserQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AnnouncementsMetaForCurrentUserQuery = {
  announcementsMetaForCurrentUser: {
    __typename: 'AnnouncementsMeta';
    count: number;
    readAt: string | null;
  } | null;
};

export type AnnoucentmentsByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type AnnoucentmentsByRoomIdQuery = {
  announcementsByRoomId: {
    __typename: 'AnnouncementConnection';
    edges: Array<{
      __typename: 'AnnouncementEdge';
      node: {
        __typename: 'Announcement';
        id: string;
        body: string;
        bodyRendered: string | null;
        createdAt: string;
        updatedAt: string | null;
        title: string;
      };
    } | null> | null;
  } | null;
};

export type AnnouncementsForCurrentUserQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AnnouncementsForCurrentUserQuery = {
  announcementsForCurrentUser: {
    __typename: 'AnnouncementConnection';
    edges: Array<{
      __typename: 'AnnouncementEdge';
      node: {
        __typename: 'Announcement';
        body: string;
        bodyRendered: string | null;
        createdAt: string;
        updatedAt: string | null;
        id: string;
        title: string;
        room: { __typename: 'Room'; id: string; name: string } | null;
      };
    } | null> | null;
  } | null;
};

export type CreateAnnouncementMutationVariables = Exact<{
  roomId: string;
  title: string;
  body: string;
}>;

export type CreateAnnouncementMutation = {
  createAnnouncement: {
    __typename: 'Announcement';
    body: string;
    bodyRendered: string | null;
    createdAt: string;
    title: string;
    id: string;
  };
};

export type UpdateAnnouncementMutationVariables = Exact<{
  id: string;
  title?: string | null;
  body?: string | null;
}>;

export type UpdateAnnouncementMutation = {
  updateAnnouncement: {
    __typename: 'Announcement';
    body: string;
    bodyRendered: string | null;
    updatedAt: string | null;
    title: string;
    id: string;
  };
};

export type DeleteAnnouncementMutationVariables = Exact<{
  id: string;
}>;

export type DeleteAnnouncementMutation = { deleteAnnouncement: string };

export type PostDetailsFragment = {
  __typename: 'Post';
  id: string;
  body: string;
  correct: Types.CorrectState | null;
  favorite: boolean | null;
  createdAt: string;
  score: number | null;
  userVote: number | null;
  moderationState: Types.ModerationState;
  tags: Array<{ __typename: 'Tag'; name: string; id: string }> | null;
  replies: Array<{
    __typename: 'Reply';
    id: string;
    body: string;
    bodyRendered: string | null;
    createdAt: string;
  }> | null;
};

export type ReplyDetailsFragment = {
  __typename: 'Reply';
  id: string;
  body: string;
  bodyRendered: string | null;
  createdAt: string;
};

export type QnasByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type QnasByRoomIdQuery = {
  qnasByRoomId: {
    __typename: 'QnaConnection';
    edges: Array<{
      __typename: 'QnaEdge';
      node: {
        __typename: 'Qna';
        id: string;
        topic: string | null;
        state: Types.QnaState | null;
        autoPublish: boolean | null;
        threshold: number | null;
        activePost: {
          __typename: 'Post';
          id: string;
          body: string;
          createdAt: string;
        } | null;
        tags: Array<{ __typename: 'Tag'; id: string; name: string }> | null;
      };
    } | null> | null;
  } | null;
};

export type StartQnaMutationVariables = Exact<{
  id: string;
}>;

export type StartQnaMutation = {
  startQna: { __typename: 'Qna'; id: string; state: Types.QnaState | null };
};

export type PauseQnaMutationVariables = Exact<{
  id: string;
}>;

export type PauseQnaMutation = {
  pauseQna: { __typename: 'Qna'; id: string; state: Types.QnaState | null };
};

export type StopQnaMutationVariables = Exact<{
  id: string;
}>;

export type StopQnaMutation = {
  stopQna: { __typename: 'Qna'; id: string; state: Types.QnaState | null };
};

export type UpdateQnaAutoPublishMutationVariables = Exact<{
  id: string;
  autoPublish: boolean;
}>;

export type UpdateQnaAutoPublishMutation = {
  updateQnaAutoPublish: {
    __typename: 'Qna';
    id: string;
    autoPublish: boolean | null;
  };
};

export type UpdateQnaThresholdMutationVariables = Exact<{
  id: string;
  threshold?: number | null;
}>;

export type UpdateQnaThresholdMutation = {
  updateQnaThreshold: {
    __typename: 'Qna';
    id: string;
    threshold: number | null;
  };
};

export type UpdateQnaActivePostIdMutationVariables = Exact<{
  id: string;
  activePostId?: string | null;
}>;

export type UpdateQnaActivePostIdMutation = {
  updateQnaActivePostId: {
    __typename: 'Qna';
    id: string;
    activePost: {
      __typename: 'Post';
      id: string;
      body: string;
      createdAt: string;
    } | null;
  };
};

export type QnaPostsByQnaIdQueryVariables = Exact<{
  query?: Types.PostQueryInput | null;
  cursor?: string | null;
}>;

export type QnaPostsByQnaIdQuery = {
  qnaPostsByQnaId: {
    __typename: 'PostConnection';
    edges: Array<{
      __typename: 'PostEdge';
      cursor: string;
      node: {
        __typename: 'Post';
        id: string;
        body: string;
        correct: Types.CorrectState | null;
        favorite: boolean | null;
        createdAt: string;
        score: number | null;
        userVote: number | null;
        moderationState: Types.ModerationState;
        tags: Array<{ __typename: 'Tag'; name: string; id: string }> | null;
        replies: Array<{
          __typename: 'Reply';
          id: string;
          body: string;
          bodyRendered: string | null;
          createdAt: string;
        }> | null;
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type QnaPostCountsByQnaIdQueryVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostCountsByQnaIdQuery = {
  qnaPostCountsByQnaId: {
    __typename: 'PostCountSummary';
    accepted: number;
    rejected: number;
  } | null;
};

export type QnaPostCountSummarySubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostCountSummarySubscription = {
  qnaPostCountSummary: {
    __typename: 'PostCountSummary';
    accepted: number;
    rejected: number;
  };
};

export type CreateQnaPostMutationVariables = Exact<{
  qnaId: string;
  body: string;
  tagIds?: Array<string> | string | null;
}>;

export type CreateQnaPostMutation = {
  createQnaPost: {
    __typename: 'Post';
    id: string;
    body: string;
    correct: Types.CorrectState | null;
    favorite: boolean | null;
    createdAt: string;
    score: number | null;
    userVote: number | null;
    tags: Array<{ __typename: 'Tag'; id: string; name: string }> | null;
  };
};

export type UpdateQnaPostFavoriteMutationVariables = Exact<{
  id: string;
  favorite: boolean;
}>;

export type UpdateQnaPostFavoriteMutation = {
  updateQnaPostFavorite: {
    __typename: 'Post';
    id: string;
    favorite: boolean | null;
  };
};

export type UpdateQnaPostCorrectMutationVariables = Exact<{
  id: string;
  correct: Types.CorrectState;
}>;

export type UpdateQnaPostCorrectMutation = {
  updateQnaPostCorrect: {
    __typename: 'Post';
    id: string;
    correct: Types.CorrectState | null;
  };
};

export type AcceptQnaPostMutationVariables = Exact<{
  id: string;
}>;

export type AcceptQnaPostMutation = {
  acceptQnaPost: {
    __typename: 'Post';
    id: string;
    moderationState: Types.ModerationState;
  };
};

export type RejectQnaPostMutationVariables = Exact<{
  id: string;
}>;

export type RejectQnaPostMutation = {
  rejectQnaPost: {
    __typename: 'Post';
    id: string;
    moderationState: Types.ModerationState;
  };
};

export type DeleteQnaPostMutationVariables = Exact<{
  id: string;
}>;

export type DeleteQnaPostMutation = { deleteQnaPost: string };

export type DeleteQnaPostsMutationVariables = Exact<{
  qnaId: string;
  moderationState?: Types.ModerationState | null;
}>;

export type DeleteQnaPostsMutation = { deleteQnaPostsByQnaId: number };

export type CreateQnaTagMutationVariables = Exact<{
  qnaId: string;
  name: string;
}>;

export type CreateQnaTagMutation = {
  createQnaTag: { __typename: 'Tag'; id: string; name: string };
};

export type DeleteQnaTagMutationVariables = Exact<{
  id: string;
}>;

export type DeleteQnaTagMutation = { deleteQnaTag: string };

export type CreateQnaReplyMutationVariables = Exact<{
  postId: string;
  body: string;
}>;

export type CreateQnaReplyMutation = {
  createQnaReply: {
    __typename: 'Reply';
    id: string;
    body: string;
    bodyRendered: string | null;
    createdAt: string;
  };
};

export type UpdateQnaReplyMutationVariables = Exact<{
  id: string;
  body: string;
}>;

export type UpdateQnaReplyMutation = {
  updateQnaReply: {
    __typename: 'Reply';
    id: string;
    body: string;
    bodyRendered: string | null;
    createdAt: string;
  };
};

export type DeleteQnaReplyMutationVariables = Exact<{
  id: string;
}>;

export type DeleteQnaReplyMutation = { deleteQnaReply: string };

export type VoteQnaPostMutationVariables = Exact<{
  postId: string;
  value: number;
}>;

export type VoteQnaPostMutation = {
  voteQnaPost: {
    __typename: 'Post';
    id: string;
    score: number | null;
    userVote: number | null;
  };
};

export type QnaStateChangedSubscriptionVariables = Exact<{
  roomId: string;
}>;

export type QnaStateChangedSubscription = {
  qnaStateChanged: {
    __typename: 'Qna';
    id: string;
    state: Types.QnaState | null;
  } | null;
};

export type ActiveQnaPostUpdatedSubscriptionVariables = Exact<{
  roomId: string;
}>;

export type ActiveQnaPostUpdatedSubscription = {
  activeQnaPostUpdated: {
    __typename: 'Qna';
    id: string;
    activePost: { __typename: 'Post'; id: string } | null;
  } | null;
};

export type QnaPostCreatedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostCreatedSubscription = {
  qnaPostCreated: { __typename: 'Post'; id: string };
};

export type QnaPostDeletedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostDeletedSubscription = {
  qnaPostDeleted: { __typename: 'Post'; id: string };
};

export type QnaPostAcceptedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostAcceptedSubscription = {
  qnaPostAccepted: { __typename: 'Post'; id: string };
};

export type QnaPostRejectedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostRejectedSubscription = {
  qnaPostRejected: { __typename: 'Post'; id: string };
};

export type QnaPostRepliedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostRepliedSubscription = {
  qnaPostReplied: {
    __typename: 'CreateReplyEvent';
    postId: string;
    reply: {
      __typename: 'Reply';
      id: string;
      body: string;
      bodyRendered: string | null;
      createdAt: string;
    };
  };
};

export type QnaPostMarkedFavoriteSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostMarkedFavoriteSubscription = {
  qnaPostMarkedFavorite: {
    __typename: 'Post';
    id: string;
    favorite: boolean | null;
  };
};

export type QnaPostMarkedCorrectSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostMarkedCorrectSubscription = {
  qnaPostMarkedCorrect: {
    __typename: 'Post';
    id: string;
    correct: Types.CorrectState | null;
  };
};

export type QnaPostVotedSubscriptionVariables = Exact<{
  qnaId: string;
}>;

export type QnaPostVotedSubscription = {
  qnaPostVoted: { __typename: 'Post'; id: string; score: number | null };
};

export type QuestionnaireSummaryFragment = {
  __typename: 'Questionnaire';
  id: string;
  name: string;
  type: Types.QuestionnaireType;
  published: boolean;
  publishingMode: Types.QuestionnairePublishingMode;
  leaderboardEnabled: boolean | null;
  contentCount: number | null;
  publishedUpToContent: {
    __typename: 'Content';
    id: string;
    position: number | null;
  } | null;
};

export type RoundFragment = {
  __typename: 'Round';
  id: string;
  contentId: string | null;
  roundNo: number;
  closed: boolean;
  started: boolean;
  answeringEndTime: string | null;
  answerable: boolean;
};

export type QuestionnaireDetailsFragment = {
  __typename: 'Questionnaire';
  id: string;
  name: string;
  type: Types.QuestionnaireType;
  published: boolean;
  publishingMode: Types.QuestionnairePublishingMode;
  statisticsPublished: boolean | null;
  correctOptionsPublished: boolean | null;
  leaderboardEnabled: boolean | null;
  contentCount: number | null;
  publishedUpToContent: {
    __typename: 'Content';
    id: string;
    position: number | null;
  } | null;
  activeRound: {
    __typename: 'Round';
    id: string;
    contentId: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answeringEndTime: string | null;
    answerable: boolean;
  } | null;
};

export type ContentDetailsFragment = {
  __typename: 'Content';
  id: string;
  body: string;
  bodyRendered: string | null;
  duration: number | null;
  abstentionsAllowed: boolean | null;
  hasCorrectAnswer: boolean | null;
  weight: number | null;
  answerCount: number | null;
  abstentionCount: number | null;
  position: number | null;
  activeRound: {
    __typename: 'Round';
    id: string;
    contentId: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answeringEndTime: string | null;
    answerable: boolean;
  } | null;
  formatData:
    | {
        __typename: 'BinaryContentFormatData';
        format: Types.ContentType;
        correctAnswer: boolean | null;
      }
    | {
        __typename: 'ChoiceContentFormatData';
        format: Types.ContentType;
        correctOptionIndexes: Array<number> | null;
        multiple: boolean | null;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'FlashcardContentFormatData';
        format: Types.ContentType;
        answer: string;
      }
    | {
        __typename: 'NumericContentFormatData';
        format: Types.ContentType;
        minNumber: number;
        maxNumber: number;
        correctNumber: number | null;
        tolerance: number;
      }
    | {
        __typename: 'PrioritizationContentFormatData';
        format: Types.ContentType;
        assignablePoints: number;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'ScaleContentFormatData';
        format: Types.ContentType;
        template: Types.ScaleContentTemplate;
        neutralOption: boolean;
      }
    | {
        __typename: 'ShortAnswerContentFormatData';
        format: Types.ContentType;
        correctTerms: Array<string>;
      }
    | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
    | {
        __typename: 'SortContentFormatData';
        format: Types.ContentType;
        correctOrder: Array<number> | null;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'TextContentFormatData';
        format: Types.ContentType;
        answersPublished: boolean;
      }
    | {
        __typename: 'WordcloudContentFormatData';
        format: Types.ContentType;
        maxAnswers: number;
      };
};

export type CreatorContentDetailsFragment = {
  __typename: 'Content';
  correctAnswerCount: number | null;
  hasAnswers: boolean;
  id: string;
  body: string;
  bodyRendered: string | null;
  duration: number | null;
  abstentionsAllowed: boolean | null;
  hasCorrectAnswer: boolean | null;
  weight: number | null;
  answerCount: number | null;
  abstentionCount: number | null;
  position: number | null;
  activeRound: {
    __typename: 'Round';
    id: string;
    contentId: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answeringEndTime: string | null;
    answerable: boolean;
  } | null;
  formatData:
    | {
        __typename: 'BinaryContentFormatData';
        format: Types.ContentType;
        correctAnswer: boolean | null;
      }
    | {
        __typename: 'ChoiceContentFormatData';
        format: Types.ContentType;
        correctOptionIndexes: Array<number> | null;
        multiple: boolean | null;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'FlashcardContentFormatData';
        format: Types.ContentType;
        answer: string;
      }
    | {
        __typename: 'NumericContentFormatData';
        format: Types.ContentType;
        minNumber: number;
        maxNumber: number;
        correctNumber: number | null;
        tolerance: number;
      }
    | {
        __typename: 'PrioritizationContentFormatData';
        format: Types.ContentType;
        assignablePoints: number;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'ScaleContentFormatData';
        format: Types.ContentType;
        template: Types.ScaleContentTemplate;
        neutralOption: boolean;
      }
    | {
        __typename: 'ShortAnswerContentFormatData';
        format: Types.ContentType;
        correctTerms: Array<string>;
      }
    | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
    | {
        __typename: 'SortContentFormatData';
        format: Types.ContentType;
        correctOrder: Array<number> | null;
        options: Array<{
          __typename: 'AnswerOption';
          label: string;
          labelRendered: string | null;
        }>;
      }
    | {
        __typename: 'TextContentFormatData';
        format: Types.ContentType;
        answersPublished: boolean;
      }
    | {
        __typename: 'WordcloudContentFormatData';
        format: Types.ContentType;
        maxAnswers: number;
      };
};

export type AnswerFragment = {
  __typename: 'Answer';
  id: string;
  result: Types.AnswerResultState;
  hidden: boolean;
  createdAt: string | null;
  durationMs: number | null;
  formatData:
    | {
        __typename: 'BinaryAnswerFormatData';
        format: Types.ContentType;
        answer: boolean;
      }
    | {
        __typename: 'ChoiceAnswerFormatData';
        format: Types.ContentType;
        selectedChoiceIndexes: Array<number>;
      }
    | {
        __typename: 'NumericAnswerFormatData';
        format: Types.ContentType;
        selectedNumber: number;
      }
    | {
        __typename: 'PrioritizationAnswerFormatData';
        format: Types.ContentType;
        assignedPoints: Array<number>;
      }
    | {
        __typename: 'ScaleAnswerFormatData';
        format: Types.ContentType;
        rating: number;
      }
    | {
        __typename: 'ShortAnswerAnswerFormatData';
        format: Types.ContentType;
        body: string;
      }
    | {
        __typename: 'SortAnswerFormatData';
        format: Types.ContentType;
        selectedChoiceIndexes: Array<number>;
      }
    | {
        __typename: 'TextAnswerFormatData';
        format: Types.ContentType;
        body: string;
      }
    | {
        __typename: 'WordcloudAnswerFormatData';
        format: Types.ContentType;
        words: Array<string>;
      }
    | null;
};

export type ContentAnswerResultFragment = {
  __typename: 'ContentAnswerResult';
  contentId: string;
  result: Types.AnswerResultState;
  durationMs: number | null;
};

export type QuestionnaireAnswerResultFragment = {
  __typename: 'QuestionnaireAnswerResult';
  correctAnswerCount: number | null;
  scorableContentCount: number | null;
  achievedScore: number | null;
  maxScore: number | null;
};

export type BinaryContentRoundStatsFragment = {
  __typename: 'BinaryContentRoundStats';
  selectionCounts: Array<number> | null;
};

export type ChoiceContentRoundStatsFragment = {
  __typename: 'ChoiceContentRoundStats';
  selectionCounts: Array<number> | null;
};

export type NumericContentRoundStatsFragment = {
  __typename: 'NumericContentRoundStats';
  selectedNumbers: Array<number> | null;
  counts: Array<number> | null;
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  minimum: number;
  maximum: number;
  correctAnswerFraction: number | null;
};

export type PrioritizationContentRoundStatsFragment = {
  __typename: 'PrioritizationContentRoundStats';
  assignedPoints: Array<number> | null;
};

export type ScaleContentRoundStatsFragment = {
  __typename: 'ScaleContentRoundStats';
  counts: Array<number> | null;
};

export type ShortAnswerContentRoundStatsFragment = {
  __typename: 'ShortAnswerContentRoundStats';
  texts: Array<string> | null;
  counts: Array<number> | null;
};

export type SortContentRoundStatsFragment = {
  __typename: 'SortContentRoundStats';
  combinations: Array<{
    __typename: 'SortCombination';
    selectedChoiceIndexes: Array<number>;
    count: number;
  }> | null;
};

export type WordcloudContentRoundStatsFragment = {
  __typename: 'WordcloudContentRoundStats';
  words: Array<string> | null;
  counts: Array<number> | null;
};

export type LeaderboardEntryFragment = {
  __typename: 'LeaderboardEntry';
  score: number;
  position: number;
  userAlias: {
    __typename: 'RoomUserAlias';
    id: string | null;
    alias: string;
    seed: number;
  } | null;
  currentResult: {
    __typename: 'LeaderboardCurrentResult';
    points: number;
    durationMs: number;
    correct: boolean;
  } | null;
};

export type LeaderboardPageFragment = {
  __typename: 'LeaderboardPage';
  totalCount: number;
  entries: Array<{
    __typename: 'LeaderboardEntry';
    score: number;
    position: number;
    userAlias: {
      __typename: 'RoomUserAlias';
      id: string | null;
      alias: string;
      seed: number;
    } | null;
    currentResult: {
      __typename: 'LeaderboardCurrentResult';
      points: number;
      durationMs: number;
      correct: boolean;
    } | null;
  }>;
  ownEntry: {
    __typename: 'LeaderboardEntry';
    score: number;
    position: number;
    userAlias: {
      __typename: 'RoomUserAlias';
      id: string | null;
      alias: string;
      seed: number;
    } | null;
    currentResult: {
      __typename: 'LeaderboardCurrentResult';
      points: number;
      durationMs: number;
      correct: boolean;
    } | null;
  } | null;
};

export type QuestionnairesByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type QuestionnairesByRoomIdQuery = {
  questionnairesByRoomId: Array<{
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
  }> | null;
};

export type PublishedQuestionnairesByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type PublishedQuestionnairesByRoomIdQuery = {
  publishedQuestionnairesByRoomId: Array<{
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
  }> | null;
};

export type QuestionnairesChangedSubscriptionVariables = Exact<{
  roomId: string;
}>;

export type QuestionnairesChangedSubscription = {
  questionnairesChanged: string;
};

export type QuestionnaireByIdQueryVariables = Exact<{
  id: string;
}>;

export type QuestionnaireByIdQuery = {
  questionnaireById: {
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    statisticsPublished: boolean | null;
    correctOptionsPublished: boolean | null;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireContentsByQuestionnaireIdQueryVariables = Exact<{
  questionnaireId: string;
}>;

export type QuestionnaireContentsByQuestionnaireIdQuery = {
  questionnaireContentsByQuestionnaireId: {
    __typename: 'ContentConnection';
    edges: Array<{
      __typename: 'ContentEdge';
      node: {
        __typename: 'Content';
        correctAnswerCount: number | null;
        hasAnswers: boolean;
        id: string;
        body: string;
        bodyRendered: string | null;
        duration: number | null;
        abstentionsAllowed: boolean | null;
        hasCorrectAnswer: boolean | null;
        weight: number | null;
        answerCount: number | null;
        abstentionCount: number | null;
        position: number | null;
        activeRound: {
          __typename: 'Round';
          id: string;
          contentId: string | null;
          roundNo: number;
          closed: boolean;
          started: boolean;
          answeringEndTime: string | null;
          answerable: boolean;
        } | null;
        formatData:
          | {
              __typename: 'BinaryContentFormatData';
              format: Types.ContentType;
              correctAnswer: boolean | null;
            }
          | {
              __typename: 'ChoiceContentFormatData';
              format: Types.ContentType;
              correctOptionIndexes: Array<number> | null;
              multiple: boolean | null;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'FlashcardContentFormatData';
              format: Types.ContentType;
              answer: string;
            }
          | {
              __typename: 'NumericContentFormatData';
              format: Types.ContentType;
              minNumber: number;
              maxNumber: number;
              correctNumber: number | null;
              tolerance: number;
            }
          | {
              __typename: 'PrioritizationContentFormatData';
              format: Types.ContentType;
              assignablePoints: number;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'ScaleContentFormatData';
              format: Types.ContentType;
              template: Types.ScaleContentTemplate;
              neutralOption: boolean;
            }
          | {
              __typename: 'ShortAnswerContentFormatData';
              format: Types.ContentType;
              correctTerms: Array<string>;
            }
          | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
          | {
              __typename: 'SortContentFormatData';
              format: Types.ContentType;
              correctOrder: Array<number> | null;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'TextContentFormatData';
              format: Types.ContentType;
              answersPublished: boolean;
            }
          | {
              __typename: 'WordcloudContentFormatData';
              format: Types.ContentType;
              maxAnswers: number;
            };
      };
    } | null> | null;
  } | null;
};

export type QuestionnairePublishedContentsByQuestionnaireIdQueryVariables =
  Exact<{
    questionnaireId: string;
  }>;

export type QuestionnairePublishedContentsByQuestionnaireIdQuery = {
  questionnairePublishedContentsByQuestionnaireId: {
    __typename: 'ContentConnection';
    edges: Array<{
      __typename: 'ContentEdge';
      node: {
        __typename: 'Content';
        id: string;
        body: string;
        bodyRendered: string | null;
        duration: number | null;
        abstentionsAllowed: boolean | null;
        hasCorrectAnswer: boolean | null;
        weight: number | null;
        answerCount: number | null;
        abstentionCount: number | null;
        position: number | null;
        activeRound: {
          __typename: 'Round';
          id: string;
          contentId: string | null;
          roundNo: number;
          closed: boolean;
          started: boolean;
          answeringEndTime: string | null;
          answerable: boolean;
        } | null;
        formatData:
          | {
              __typename: 'BinaryContentFormatData';
              format: Types.ContentType;
              correctAnswer: boolean | null;
            }
          | {
              __typename: 'ChoiceContentFormatData';
              format: Types.ContentType;
              correctOptionIndexes: Array<number> | null;
              multiple: boolean | null;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'FlashcardContentFormatData';
              format: Types.ContentType;
              answer: string;
            }
          | {
              __typename: 'NumericContentFormatData';
              format: Types.ContentType;
              minNumber: number;
              maxNumber: number;
              correctNumber: number | null;
              tolerance: number;
            }
          | {
              __typename: 'PrioritizationContentFormatData';
              format: Types.ContentType;
              assignablePoints: number;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'ScaleContentFormatData';
              format: Types.ContentType;
              template: Types.ScaleContentTemplate;
              neutralOption: boolean;
            }
          | {
              __typename: 'ShortAnswerContentFormatData';
              format: Types.ContentType;
              correctTerms: Array<string>;
            }
          | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
          | {
              __typename: 'SortContentFormatData';
              format: Types.ContentType;
              correctOrder: Array<number> | null;
              options: Array<{
                __typename: 'AnswerOption';
                label: string;
                labelRendered: string | null;
              }>;
            }
          | {
              __typename: 'TextContentFormatData';
              format: Types.ContentType;
              answersPublished: boolean;
            }
          | {
              __typename: 'WordcloudContentFormatData';
              format: Types.ContentType;
              maxAnswers: number;
            };
      };
    } | null> | null;
  } | null;
};

export type CreateQuestionnaireMutationVariables = Exact<{
  input: Types.CreateQuestionnaireInput;
}>;

export type CreateQuestionnaireMutation = {
  createQuestionnaire: {
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    statisticsPublished: boolean | null;
    correctOptionsPublished: boolean | null;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  };
};

export type ToggleQuestionnairePublishedMutationVariables = Exact<{
  id: string;
  published: boolean;
}>;

export type ToggleQuestionnairePublishedMutation = {
  toggleQuestionnairePublished: {
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    statisticsPublished: boolean | null;
    correctOptionsPublished: boolean | null;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  };
};

export type CreateQuestionnaireBinaryContentMutationVariables = Exact<{
  input: Types.CreateBinaryContentInput;
}>;

export type CreateQuestionnaireBinaryContentMutation = {
  createQuestionnaireBinaryContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireBinaryContentMutationVariables = Exact<{
  input: Types.UpdateBinaryContentInput;
}>;

export type UpdateQuestionnaireBinaryContentMutation = {
  updateQuestionnaireBinaryContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireChoiceContentMutationVariables = Exact<{
  input: Types.CreateChoiceContentInput;
}>;

export type CreateQuestionnaireChoiceContentMutation = {
  createQuestionnaireChoiceContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireChoiceContentMutationVariables = Exact<{
  input: Types.UpdateChoiceContentInput;
}>;

export type UpdateQuestionnaireChoiceContentMutation = {
  updateQuestionnaireChoiceContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireNumericContentMutationVariables = Exact<{
  input: Types.CreateNumericContentInput;
}>;

export type CreateQuestionnaireNumericContentMutation = {
  createQuestionnaireNumericContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireNumericContentMutationVariables = Exact<{
  input: Types.UpdateNumericContentInput;
}>;

export type UpdateQuestionnaireNumericContentMutation = {
  updateQuestionnaireNumericContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnairePrioritizationContentMutationVariables = Exact<{
  input: Types.CreatePrioritizationContentInput;
}>;

export type CreateQuestionnairePrioritizationContentMutation = {
  createQuestionnairePrioritizationContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnairePrioritizationContentMutationVariables = Exact<{
  input: Types.UpdatePrioritizationContentInput;
}>;

export type UpdateQuestionnairePrioritizationContentMutation = {
  updateQuestionnairePrioritizationContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireScaleContentMutationVariables = Exact<{
  input: Types.CreateScaleContentInput;
}>;

export type CreateQuestionnaireScaleContentMutation = {
  createQuestionnaireScaleContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireScaleContentMutationVariables = Exact<{
  input: Types.UpdateScaleContentInput;
}>;

export type UpdateQuestionnaireScaleContentMutation = {
  updateQuestionnaireScaleContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireShortAnswerContentMutationVariables = Exact<{
  input: Types.CreateShortAnswerContentInput;
}>;

export type CreateQuestionnaireShortAnswerContentMutation = {
  createQuestionnaireShortAnswerContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireShortAnswerContentMutationVariables = Exact<{
  input: Types.UpdateShortAnswerContentInput;
}>;

export type UpdateQuestionnaireShortAnswerContentMutation = {
  updateQuestionnaireShortAnswerContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireSortContentMutationVariables = Exact<{
  input: Types.CreateSortContentInput;
}>;

export type CreateQuestionnaireSortContentMutation = {
  createQuestionnaireSortContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireSortContentMutationVariables = Exact<{
  input: Types.UpdateSortContentInput;
}>;

export type UpdateQuestionnaireSortContentMutation = {
  updateQuestionnaireSortContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireWordcloudContentMutationVariables = Exact<{
  input: Types.CreateWordcloudContentInput;
}>;

export type CreateQuestionnaireWordcloudContentMutation = {
  createQuestionnaireWordcloudContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireWordcloudContentMutationVariables = Exact<{
  input: Types.UpdateWordcloudContentInput;
}>;

export type UpdateQuestionnaireWordcloudContentMutation = {
  updateQuestionnaireWordcloudContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireTextContentMutationVariables = Exact<{
  input: Types.CreateTextContentInput;
}>;

export type CreateQuestionnaireTextContentMutation = {
  createQuestionnaireTextContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireTextContentMutationVariables = Exact<{
  input: Types.UpdateTextContentInput;
}>;

export type UpdateQuestionnaireTextContentMutation = {
  updateQuestionnaireTextContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireFlashcardContentMutationVariables = Exact<{
  input: Types.CreateFlashcardContentInput;
}>;

export type CreateQuestionnaireFlashcardContentMutation = {
  createQuestionnaireFlashcardContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireFlashcardContentMutationVariables = Exact<{
  input: Types.UpdateFlashcardContentInput;
}>;

export type UpdateQuestionnaireFlashcardContentMutation = {
  updateQuestionnaireFlashcardContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireSlideContentMutationVariables = Exact<{
  input: Types.CreateSlideContentInput;
}>;

export type CreateQuestionnaireSlideContentMutation = {
  createQuestionnaireSlideContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireSlideContentMutationVariables = Exact<{
  input: Types.UpdateSlideContentInput;
}>;

export type UpdateQuestionnaireSlideContentMutation = {
  updateQuestionnaireSlideContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type QuestionnaireContentByIdQueryVariables = Exact<{
  id: string;
}>;

export type QuestionnaireContentByIdQuery = {
  questionnaireContentById: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type QuestionnaireAnswerByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireAnswerByRoundIdQuery = {
  questionnaireAnswerByRoundId: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type QuestionnaireContentAnswerResultsByQuestionnaireIdQueryVariables =
  Exact<{
    questionnaireId: string;
  }>;

export type QuestionnaireContentAnswerResultsByQuestionnaireIdQuery = {
  questionnaireContentAnswerResultsByQuestionnaireId: Array<{
    __typename: 'ContentAnswerResult';
    contentId: string;
    result: Types.AnswerResultState;
    durationMs: number | null;
  }> | null;
};

export type QuestionnaireAnswerResultsByQuestionnaireIdQueryVariables = Exact<{
  questionnaireId: string;
}>;

export type QuestionnaireAnswerResultsByQuestionnaireIdQuery = {
  questionnaireAnswerResultsByQuestionnaireId: {
    __typename: 'QuestionnaireAnswerResult';
    correctAnswerCount: number | null;
    scorableContentCount: number | null;
    achievedScore: number | null;
    maxScore: number | null;
  } | null;
};

export type QuestionnaireLeaderboardByQuestionnaireIdQueryVariables = Exact<{
  questionnaireId: string;
  contentId?: string | null;
  limit?: number | null;
}>;

export type QuestionnaireLeaderboardByQuestionnaireIdQuery = {
  questionnaireLeaderboardByQuestionnaireId: {
    __typename: 'LeaderboardPage';
    totalCount: number;
    entries: Array<{
      __typename: 'LeaderboardEntry';
      score: number;
      position: number;
      userAlias: {
        __typename: 'RoomUserAlias';
        id: string | null;
        alias: string;
        seed: number;
      } | null;
      currentResult: {
        __typename: 'LeaderboardCurrentResult';
        points: number;
        durationMs: number;
        correct: boolean;
      } | null;
    }>;
    ownEntry: {
      __typename: 'LeaderboardEntry';
      score: number;
      position: number;
      userAlias: {
        __typename: 'RoomUserAlias';
        id: string | null;
        alias: string;
        seed: number;
      } | null;
      currentResult: {
        __typename: 'LeaderboardCurrentResult';
        points: number;
        durationMs: number;
        correct: boolean;
      } | null;
    } | null;
  };
};

export type QuestionnaireBinaryRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireBinaryRoundStatsByRoundIdQuery = {
  questionnaireBinaryRoundStatsByRoundId: {
    __typename: 'BinaryContentRoundStats';
    selectionCounts: Array<number> | null;
  } | null;
};

export type QuestionnaireChoiceRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireChoiceRoundStatsByRoundIdQuery = {
  questionnaireChoiceRoundStatsByRoundId: {
    __typename: 'ChoiceContentRoundStats';
    selectionCounts: Array<number> | null;
  } | null;
};

export type QuestionnaireNumericRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireNumericRoundStatsByRoundIdQuery = {
  questionnaireNumericRoundStatsByRoundId: {
    __typename: 'NumericContentRoundStats';
    selectedNumbers: Array<number> | null;
    counts: Array<number> | null;
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    minimum: number;
    maximum: number;
    correctAnswerFraction: number | null;
  } | null;
};

export type QuestionnairePrioritizationRoundStatsByRoundIdQueryVariables =
  Exact<{
    roundId: string;
  }>;

export type QuestionnairePrioritizationRoundStatsByRoundIdQuery = {
  questionnairePrioritizationRoundStatsByRoundId: {
    __typename: 'PrioritizationContentRoundStats';
    assignedPoints: Array<number> | null;
  } | null;
};

export type QuestionnaireScaleRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireScaleRoundStatsByRoundIdQuery = {
  questionnaireScaleRoundStatsByRoundId: {
    __typename: 'ScaleContentRoundStats';
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireShortAnswerRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireShortAnswerRoundStatsByRoundIdQuery = {
  questionnaireShortAnswerRoundStatsByRoundId: {
    __typename: 'ShortAnswerContentRoundStats';
    texts: Array<string> | null;
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireSortRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireSortRoundStatsByRoundIdQuery = {
  questionnaireSortRoundStatsByRoundId: {
    __typename: 'SortContentRoundStats';
    combinations: Array<{
      __typename: 'SortCombination';
      selectedChoiceIndexes: Array<number>;
      count: number;
    }> | null;
  } | null;
};

export type QuestionnaireWordcloudRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireWordcloudRoundStatsByRoundIdQuery = {
  questionnaireWordcloudRoundStatsByRoundId: {
    __typename: 'WordcloudContentRoundStats';
    words: Array<string> | null;
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireTextAnswersByRoundIdQueryVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireTextAnswersByRoundIdQuery = {
  questionnaireTextAnswersByRoundId: Array<{
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  }> | null;
};

export type CreateQuestionnaireBinaryAnswerMutationVariables = Exact<{
  roundId: string;
  answer: boolean;
}>;

export type CreateQuestionnaireBinaryAnswerMutation = {
  createQuestionnaireBinaryAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireChoiceAnswerMutationVariables = Exact<{
  input: Types.CreateChoiceAnswerInput;
}>;

export type CreateQuestionnaireChoiceAnswerMutation = {
  createQuestionnaireChoiceAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireNumericAnswerMutationVariables = Exact<{
  roundId: string;
  selectedNumber: number;
}>;

export type CreateQuestionnaireNumericAnswerMutation = {
  createQuestionnaireNumericAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnairePrioritizationAnswerMutationVariables = Exact<{
  roundId: string;
  assignedPoints: Array<number> | number;
}>;

export type CreateQuestionnairePrioritizationAnswerMutation = {
  createQuestionnairePrioritizationAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireScaleAnswerMutationVariables = Exact<{
  roundId: string;
  rating: number;
}>;

export type CreateQuestionnaireScaleAnswerMutation = {
  createQuestionnaireScaleAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireShortAnswerAnswerMutationVariables = Exact<{
  roundId: string;
  body: string;
}>;

export type CreateQuestionnaireShortAnswerAnswerMutation = {
  createQuestionnaireShortAnswerAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireSortAnswerMutationVariables = Exact<{
  roundId: string;
  selectedChoiceIndexes: Array<number> | number;
}>;

export type CreateQuestionnaireSortAnswerMutation = {
  createQuestionnaireSortAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireWordcloudAnswerMutationVariables = Exact<{
  input: Types.CreateWordcloudAnswerInput;
}>;

export type CreateQuestionnaireWordcloudAnswerMutation = {
  createQuestionnaireWordcloudAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireTextAnswerMutationVariables = Exact<{
  roundId: string;
  body: string;
}>;

export type CreateQuestionnaireTextAnswerMutation = {
  createQuestionnaireTextAnswer: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireAbstentionMutationVariables = Exact<{
  roundId: string;
}>;

export type CreateQuestionnaireAbstentionMutation = {
  createQuestionnaireAbstention: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type DeleteQuestionnaireContentMutationVariables = Exact<{
  id: string;
}>;

export type DeleteQuestionnaireContentMutation = {
  deleteQuestionnaireContent: string | null;
};

export type DeleteQuestionnaireMutationVariables = Exact<{
  id: string;
}>;

export type DeleteQuestionnaireMutation = {
  deleteQuestionnaire: string | null;
};

export type DeleteQuestionnaireAnswersByContentIdMutationVariables = Exact<{
  contentId: string;
}>;

export type DeleteQuestionnaireAnswersByContentIdMutation = {
  deleteQuestionnaireAnswersByContentId: boolean | null;
};

export type BanQuestionnaireShortAnswerContentKeywordMutationVariables = Exact<{
  contentId: string;
  keyword: string;
}>;

export type BanQuestionnaireShortAnswerContentKeywordMutation = {
  banQuestionnaireShortAnswerContentKeyword: {
    __typename: 'Content';
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type BanQuestionnaireWordcloudContentKeywordMutationVariables = Exact<{
  contentId: string;
  keyword: string;
}>;

export type BanQuestionnaireWordcloudContentKeywordMutation = {
  banQuestionnaireWordcloudContentKeyword: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ResetBannedQuestionnaireShortAnswerContentKeywordsMutationVariables =
  Exact<{
    contentId: string;
  }>;

export type ResetBannedQuestionnaireShortAnswerContentKeywordsMutation = {
  resetBannedQuestionnaireShortAnswerContentKeywords: {
    __typename: 'Content';
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ResetBannedQuestionnaireWordcloudContentKeywordsMutationVariables =
  Exact<{
    contentId: string;
  }>;

export type ResetBannedQuestionnaireWordcloudContentKeywordsMutation = {
  resetBannedQuestionnaireWordcloudContentKeywords: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ToggleQuestionnaireTextContentAnswersPublishedMutationVariables =
  Exact<{
    contentId: string;
    published: boolean;
  }>;

export type ToggleQuestionnaireTextContentAnswersPublishedMutation = {
  toggleQuestionnaireTextContentAnswersPublished: {
    __typename: 'Content';
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ToggleQuestionnaireTextAnswerHiddenMutationVariables = Exact<{
  answerId: string;
  hidden: boolean;
}>;

export type ToggleQuestionnaireTextAnswerHiddenMutation = {
  toggleQuestionnaireTextAnswerHidden: {
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type ResetQuestionnaireResultsMutationVariables = Exact<{
  id: string;
}>;

export type ResetQuestionnaireResultsMutation = {
  resetQuestionnaireResults: boolean | null;
};

export type UpdateQuestionnaireMutationVariables = Exact<{
  id: string;
  name?: string | null;
  published?: boolean | null;
  publishingMode?: Types.QuestionnairePublishingMode | null;
  statisticsPublished?: boolean | null;
  correctOptionsPublished?: boolean | null;
  leaderboardEnabled?: boolean | null;
}>;

export type UpdateQuestionnaireMutation = {
  updateQuestionnaire: {
    __typename: 'Questionnaire';
    id: string;
    name: string;
    type: Types.QuestionnaireType;
    published: boolean;
    publishingMode: Types.QuestionnairePublishingMode;
    statisticsPublished: boolean | null;
    correctOptionsPublished: boolean | null;
    leaderboardEnabled: boolean | null;
    contentCount: number | null;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  };
};

export type DuplicateQuestionnaireContentMutationVariables = Exact<{
  id: string;
}>;

export type DuplicateQuestionnaireContentMutation = {
  duplicateQuestionnaireContent: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CopyQuestionnaireContentToQuestionnaireMutationVariables = Exact<{
  contentId: string;
  questionnaireId: string;
}>;

export type CopyQuestionnaireContentToQuestionnaireMutation = {
  copyQuestionnaireContentToQuestionnaire: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type MoveQuestionnaireContentToQuestionnaireMutationVariables = Exact<{
  contentId: string;
  questionnaireId: string;
}>;

export type MoveQuestionnaireContentToQuestionnaireMutation = {
  moveQuestionnaireContentToQuestionnaire: {
    __typename: 'Content';
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered: string | null;
    duration: number | null;
    abstentionsAllowed: boolean | null;
    hasCorrectAnswer: boolean | null;
    weight: number | null;
    answerCount: number | null;
    abstentionCount: number | null;
    position: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename: 'BinaryContentFormatData';
          format: Types.ContentType;
          correctAnswer: boolean | null;
        }
      | {
          __typename: 'ChoiceContentFormatData';
          format: Types.ContentType;
          correctOptionIndexes: Array<number> | null;
          multiple: boolean | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'FlashcardContentFormatData';
          format: Types.ContentType;
          answer: string;
        }
      | {
          __typename: 'NumericContentFormatData';
          format: Types.ContentType;
          minNumber: number;
          maxNumber: number;
          correctNumber: number | null;
          tolerance: number;
        }
      | {
          __typename: 'PrioritizationContentFormatData';
          format: Types.ContentType;
          assignablePoints: number;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'ScaleContentFormatData';
          format: Types.ContentType;
          template: Types.ScaleContentTemplate;
          neutralOption: boolean;
        }
      | {
          __typename: 'ShortAnswerContentFormatData';
          format: Types.ContentType;
          correctTerms: Array<string>;
        }
      | { __typename: 'SlideContentFormatData'; format: Types.ContentType }
      | {
          __typename: 'SortContentFormatData';
          format: Types.ContentType;
          correctOrder: Array<number> | null;
          options: Array<{
            __typename: 'AnswerOption';
            label: string;
            labelRendered: string | null;
          }>;
        }
      | {
          __typename: 'TextContentFormatData';
          format: Types.ContentType;
          answersPublished: boolean;
        }
      | {
          __typename: 'WordcloudContentFormatData';
          format: Types.ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireContentOrderMutationVariables = Exact<{
  questionnaireId: string;
  contentIds: Array<string> | string;
}>;

export type UpdateQuestionnaireContentOrderMutation = {
  updateQuestionnaireContentOrder: {
    __typename: 'Questionnaire';
    id: string;
  } | null;
};

export type QuestionnaireUpdatedSubscriptionVariables = Exact<{
  questionnaireId: string;
}>;

export type QuestionnaireUpdatedSubscription = {
  questionnaireUpdated: {
    __typename: 'Questionnaire';
    id: string;
    publishingMode: Types.QuestionnairePublishingMode;
    publishedUpToContent: {
      __typename: 'Content';
      id: string;
      position: number | null;
    } | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireContentUpdatedSubscriptionVariables = Exact<{
  questionnaireId: string;
}>;

export type QuestionnaireContentUpdatedSubscription = {
  questionnaireContentUpdated: {
    __typename: 'Content';
    id: string;
    answerCount: number | null;
    abstentionCount: number | null;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  } | null;
};

export type CreatorQuestionnaireContentUpdatedSubscriptionVariables = Exact<{
  questionnaireId: string;
}>;

export type CreatorQuestionnaireContentUpdatedSubscription = {
  questionnaireContentUpdated: {
    __typename: 'Content';
    id: string;
    answerCount: number | null;
    abstentionCount: number | null;
    correctAnswerCount: number | null;
    hasAnswers: boolean;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireBinaryRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireBinaryRoundStatsUpdatedSubscription = {
  questionnaireBinaryRoundStatsUpdated: {
    __typename: 'BinaryContentRoundStats';
    selectionCounts: Array<number> | null;
  } | null;
};

export type QuestionnaireChoiceRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireChoiceRoundStatsUpdatedSubscription = {
  questionnaireChoiceRoundStatsUpdated: {
    __typename: 'ChoiceContentRoundStats';
    selectionCounts: Array<number> | null;
  } | null;
};

export type QuestionnaireNumericRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireNumericRoundStatsUpdatedSubscription = {
  questionnaireNumericRoundStatsUpdated: {
    __typename: 'NumericContentRoundStats';
    selectedNumbers: Array<number> | null;
    counts: Array<number> | null;
    mean: number;
    median: number;
    standardDeviation: number;
    variance: number;
    minimum: number;
    maximum: number;
    correctAnswerFraction: number | null;
  } | null;
};

export type QuestionnairePrioritizationRoundStatsUpdatedSubscriptionVariables =
  Exact<{
    roundId: string;
  }>;

export type QuestionnairePrioritizationRoundStatsUpdatedSubscription = {
  questionnairePrioritizationRoundStatsUpdated: {
    __typename: 'PrioritizationContentRoundStats';
    assignedPoints: Array<number> | null;
  } | null;
};

export type QuestionnaireScaleRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireScaleRoundStatsUpdatedSubscription = {
  questionnaireScaleRoundStatsUpdated: {
    __typename: 'ScaleContentRoundStats';
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireShortAnswerRoundStatsUpdatedSubscriptionVariables =
  Exact<{
    roundId: string;
  }>;

export type QuestionnaireShortAnswerRoundStatsUpdatedSubscription = {
  questionnaireShortAnswerRoundStatsUpdated: {
    __typename: 'ShortAnswerContentRoundStats';
    texts: Array<string> | null;
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireSortRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireSortRoundStatsUpdatedSubscription = {
  questionnaireSortRoundStatsUpdated: {
    __typename: 'SortContentRoundStats';
    combinations: Array<{
      __typename: 'SortCombination';
      selectedChoiceIndexes: Array<number>;
      count: number;
    }> | null;
  } | null;
};

export type QuestionnaireWordcloudRoundStatsUpdatedSubscriptionVariables =
  Exact<{
    roundId: string;
  }>;

export type QuestionnaireWordcloudRoundStatsUpdatedSubscription = {
  questionnaireWordcloudRoundStatsUpdated: {
    __typename: 'WordcloudContentRoundStats';
    words: Array<string> | null;
    counts: Array<number> | null;
  } | null;
};

export type QuestionnaireTextAnswersUpdatedSubscriptionVariables = Exact<{
  roundId: string;
}>;

export type QuestionnaireTextAnswersUpdatedSubscription = {
  questionnaireTextAnswersUpdated: Array<{
    __typename: 'Answer';
    id: string;
    result: Types.AnswerResultState;
    hidden: boolean;
    createdAt: string | null;
    durationMs: number | null;
    formatData:
      | {
          __typename: 'BinaryAnswerFormatData';
          format: Types.ContentType;
          answer: boolean;
        }
      | {
          __typename: 'ChoiceAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'NumericAnswerFormatData';
          format: Types.ContentType;
          selectedNumber: number;
        }
      | {
          __typename: 'PrioritizationAnswerFormatData';
          format: Types.ContentType;
          assignedPoints: Array<number>;
        }
      | {
          __typename: 'ScaleAnswerFormatData';
          format: Types.ContentType;
          rating: number;
        }
      | {
          __typename: 'ShortAnswerAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'SortAnswerFormatData';
          format: Types.ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename: 'TextAnswerFormatData';
          format: Types.ContentType;
          body: string;
        }
      | {
          __typename: 'WordcloudAnswerFormatData';
          format: Types.ContentType;
          words: Array<string>;
        }
      | null;
  }> | null;
};

export type QuestionnaireLeaderboardUpdatedSubscriptionVariables = Exact<{
  questionnaireId: string;
  contentId?: string | null;
  limit?: number | null;
}>;

export type QuestionnaireLeaderboardUpdatedSubscription = {
  questionnaireLeaderboardUpdated: {
    __typename: 'LeaderboardPage';
    totalCount: number;
    entries: Array<{
      __typename: 'LeaderboardEntry';
      score: number;
      position: number;
      userAlias: {
        __typename: 'RoomUserAlias';
        id: string | null;
        alias: string;
        seed: number;
      } | null;
      currentResult: {
        __typename: 'LeaderboardCurrentResult';
        points: number;
        durationMs: number;
        correct: boolean;
      } | null;
    }>;
    ownEntry: {
      __typename: 'LeaderboardEntry';
      score: number;
      position: number;
      userAlias: {
        __typename: 'RoomUserAlias';
        id: string | null;
        alias: string;
        seed: number;
      } | null;
      currentResult: {
        __typename: 'LeaderboardCurrentResult';
        points: number;
        durationMs: number;
        correct: boolean;
      } | null;
    } | null;
  };
};

export type StartQuestionnaireContentMutationVariables = Exact<{
  contentId: string;
}>;

export type StartQuestionnaireContentMutation = {
  startQuestionnaireContent: {
    __typename: 'Questionnaire';
    id: string;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  };
};

export type StartQuestionnaireContentRoundMutationVariables = Exact<{
  contentId: string;
}>;

export type StartQuestionnaireContentRoundMutation = {
  startQuestionnaireContentRound: {
    __typename: 'Round';
    id: string;
    contentId: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answeringEndTime: string | null;
    answerable: boolean;
  };
};

export type StopQuestionnaireContentMutationVariables = Exact<{
  questionnaireId: string;
}>;

export type StopQuestionnaireContentMutation = {
  stopQuestionnaireContent: {
    __typename: 'Questionnaire';
    id: string;
    activeRound: {
      __typename: 'Round';
      id: string;
      contentId: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answeringEndTime: string | null;
      answerable: boolean;
    } | null;
  };
};

export type QuestionnaireRoundsByContentIdQueryVariables = Exact<{
  contentId: string;
}>;

export type QuestionnaireRoundsByContentIdQuery = {
  questionnaireRoundsByContentId: Array<{
    __typename: 'Round';
    id: string;
    contentId: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answeringEndTime: string | null;
    answerable: boolean;
  }> | null;
};

export type PublishQuestionnaireUpToContentMutationVariables = Exact<{
  questionnaireId: string;
  contentId: string;
}>;

export type PublishQuestionnaireUpToContentMutation = {
  publishQuestionnaireUpToContent: {
    __typename: 'Questionnaire';
    id: string;
    publishedUpToContent: { __typename: 'Content'; id: string } | null;
  };
};

export type RoomDetailsFragmentFragment = {
  __typename: 'Room';
  id: string;
  shortId: string;
  name: string;
  description: string | null;
  descriptionRendered: string | null;
  language: string | null;
  focusModeEnabled: boolean | null;
};

export type RoomStatsFragment = {
  __typename: 'RoomStats';
  id: string;
  activeMemberCount: number | null;
};

export type RoomMembershipFragment = {
  __typename: 'RoomMembership';
  role: Types.RoomRole;
  room: {
    __typename: 'Room';
    id: string;
    shortId: string;
    name: string;
    description: string | null;
    descriptionRendered: string | null;
    language: string | null;
    focusModeEnabled: boolean | null;
    stats: {
      __typename: 'RoomStats';
      id: string;
      activeMemberCount: number | null;
    } | null;
  };
};

export type RoomMemberFragment = {
  __typename: 'RoomMember';
  role: Types.RoomRole | null;
  user: {
    __typename: 'User';
    id: string;
    displayId: string | null;
    displayName: string | null;
    verified: boolean;
  };
};

export type RoomUserAliasFragment = {
  __typename: 'RoomUserAlias';
  id: string | null;
  alias: string;
  seed: number;
};

export type RoomIdByShortIdQueryVariables = Exact<{
  shortId: string;
}>;

export type RoomIdByShortIdQuery = {
  roomByShortId: { __typename: 'Room'; id: string } | null;
};

export type RoomLanguageByShortIdQueryVariables = Exact<{
  shortId: string;
}>;

export type RoomLanguageByShortIdQuery = {
  roomByShortId: { __typename: 'Room'; language: string | null } | null;
};

export type RoomByIdQueryVariables = Exact<{
  id: string;
}>;

export type RoomByIdQuery = {
  roomById: {
    __typename: 'Room';
    id: string;
    shortId: string;
    name: string;
    description: string | null;
    descriptionRendered: string | null;
    language: string | null;
    focusModeEnabled: boolean | null;
  } | null;
};

export type RoomFocusModeEnabledByIdQueryVariables = Exact<{
  id: string;
}>;

export type RoomFocusModeEnabledByIdQuery = {
  roomById: { __typename: 'Room'; focusModeEnabled: boolean | null } | null;
};

export type RoomByShortIdQueryVariables = Exact<{
  shortId: string;
}>;

export type RoomByShortIdQuery = {
  roomByShortId: {
    __typename: 'Room';
    id: string;
    shortId: string;
    name: string;
    description: string | null;
    descriptionRendered: string | null;
    language: string | null;
    focusModeEnabled: boolean | null;
  } | null;
};

export type RoomsQueryVariables = Exact<{
  room: Types.RoomQueryInput;
  cursor?: string | null;
}>;

export type RoomsQuery = {
  rooms: {
    __typename: 'RoomConnection';
    edges: Array<{
      __typename: 'RoomEdge';
      cursor: string;
      node: {
        __typename: 'Room';
        id: string;
        shortId: string;
        name: string;
        description: string | null;
        descriptionRendered: string | null;
        language: string | null;
        focusModeEnabled: boolean | null;
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type RoomMembershipByIdQueryVariables = Exact<{
  roomId: string;
}>;

export type RoomMembershipByIdQuery = {
  roomMembershipById: {
    __typename: 'RoomMembership';
    role: Types.RoomRole;
    room: {
      __typename: 'Room';
      id: string;
      shortId: string;
      name: string;
      description: string | null;
      descriptionRendered: string | null;
      language: string | null;
      focusModeEnabled: boolean | null;
      stats: {
        __typename: 'RoomStats';
        id: string;
        activeMemberCount: number | null;
      } | null;
    };
  } | null;
};

export type RoomMembershipByShortIdQueryVariables = Exact<{
  shortId: string;
}>;

export type RoomMembershipByShortIdQuery = {
  roomMembershipByShortId: {
    __typename: 'RoomMembership';
    role: Types.RoomRole;
    room: {
      __typename: 'Room';
      id: string;
      shortId: string;
      name: string;
      description: string | null;
      descriptionRendered: string | null;
      language: string | null;
      focusModeEnabled: boolean | null;
      stats: {
        __typename: 'RoomStats';
        id: string;
        activeMemberCount: number | null;
      } | null;
    };
  } | null;
};

export type RoomMembershipsQueryVariables = Exact<{
  query?: Types.RoomQueryInput | null;
  cursor?: string | null;
}>;

export type RoomMembershipsQuery = {
  roomMemberships: {
    __typename: 'RoomMembershipConnection';
    edges: Array<{
      __typename: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename: 'RoomMembership';
        role: Types.RoomRole;
        room: {
          __typename: 'Room';
          id: string;
          shortId: string;
          name: string;
          description: string | null;
          descriptionRendered: string | null;
          language: string | null;
          focusModeEnabled: boolean | null;
          stats: {
            __typename: 'RoomStats';
            id: string;
            activeMemberCount: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type RoomsByUserIdQueryVariables = Exact<{
  userId: string;
  cursor?: string | null;
}>;

export type RoomsByUserIdQuery = {
  roomsByUserId: {
    __typename: 'RoomMembershipConnection';
    edges: Array<{
      __typename: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename: 'RoomMembership';
        role: Types.RoomRole;
        room: {
          __typename: 'Room';
          id: string;
          shortId: string;
          name: string;
          description: string | null;
          descriptionRendered: string | null;
          language: string | null;
          focusModeEnabled: boolean | null;
          stats: {
            __typename: 'RoomStats';
            id: string;
            activeMemberCount: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename: 'PageInfo';
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
    };
  } | null;
};

export type RoomStatsByIdQueryVariables = Exact<{
  id: string;
}>;

export type RoomStatsByIdQuery = {
  roomById: {
    __typename: 'Room';
    stats: {
      __typename: 'RoomStats';
      id: string;
      activeMemberCount: number | null;
    } | null;
  } | null;
};

export type JoinRoomMutationVariables = Exact<{
  shortId: string;
}>;

export type JoinRoomMutation = {
  joinRoom: {
    __typename: 'RoomMembership';
    role: Types.RoomRole;
    room: {
      __typename: 'Room';
      id: string;
      shortId: string;
      name: string;
      description: string | null;
      descriptionRendered: string | null;
      language: string | null;
      focusModeEnabled: boolean | null;
      stats: {
        __typename: 'RoomStats';
        id: string;
        activeMemberCount: number | null;
      } | null;
    };
  };
};

export type CreateRoomMutationVariables = Exact<{
  name: string;
}>;

export type CreateRoomMutation = {
  createRoom: { __typename: 'Room'; id: string; shortId: string };
};

export type DeleteRoomMutationVariables = Exact<{
  id: string;
}>;

export type DeleteRoomMutation = { deleteRoom: string };

export type DuplicateRoomMutationVariables = Exact<{
  id: string;
  newName: string;
}>;

export type DuplicateRoomMutation = {
  duplicateRoom: { __typename: 'Room'; id: string; shortId: string };
};

export type DuplicateDemoRoomMutationVariables = Exact<{
  [key: string]: never;
}>;

export type DuplicateDemoRoomMutation = {
  duplicateDemoRoom: { __typename: 'Room'; id: string; shortId: string };
};

export type UpdateRoomDetailsMutationVariables = Exact<{
  id: string;
  name: string;
  description: string;
  languageCode?: string | null;
}>;

export type UpdateRoomDetailsMutation = {
  updateRoomName: { __typename: 'Room'; id: string; name: string };
  updateRoomDescription: {
    __typename: 'Room';
    id: string;
    description: string | null;
    descriptionRendered: string | null;
  };
  updateRoomLanguage: {
    __typename: 'Room';
    id: string;
    language: string | null;
  };
};

export type UpdateRoomLanguageMutationVariables = Exact<{
  id: string;
  languageCode: string;
}>;

export type UpdateRoomLanguageMutation = {
  updateRoomLanguage: {
    __typename: 'Room';
    id: string;
    language: string | null;
  };
};

export type UpdateRoomFocusModeMutationVariables = Exact<{
  id: string;
  enabled: boolean;
}>;

export type UpdateRoomFocusModeMutation = {
  updateRoomFocusMode: {
    __typename: 'Room';
    id: string;
    focusModeEnabled: boolean | null;
  };
};

export type RoomManagingMembersByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type RoomManagingMembersByRoomIdQuery = {
  roomManagingMembersByRoomId: Array<{
    __typename: 'RoomMember';
    role: Types.RoomRole | null;
    user: {
      __typename: 'User';
      id: string;
      displayId: string | null;
      displayName: string | null;
      verified: boolean;
    };
  }> | null;
};

export type GrantRoomRoleMutationVariables = Exact<{
  roomId: string;
  userId: string;
  role: Types.RoomRole;
}>;

export type GrantRoomRoleMutation = {
  grantRoomRole: {
    __typename: 'RoomMember';
    role: Types.RoomRole | null;
    room: { __typename: 'Room'; id: string };
    user: { __typename: 'User'; id: string };
  };
};

export type GrantRoomRoleByInvitationMutationVariables = Exact<{
  roomId: string;
  mailAddress: string;
  role: Types.RoomRole;
}>;

export type GrantRoomRoleByInvitationMutation = {
  grantRoomRoleByInvitation: {
    __typename: 'RoomMember';
    role: Types.RoomRole | null;
    room: { __typename: 'Room'; id: string };
    user: { __typename: 'User'; id: string };
  };
};

export type RevokeRoomRoleMutationVariables = Exact<{
  roomId: string;
  userId: string;
}>;

export type RevokeRoomRoleMutation = {
  revokeRoomRole: {
    __typename: 'RoomMember';
    room: { __typename: 'Room'; id: string };
    user: { __typename: 'User'; id: string };
  };
};

export type RevokeRoomMembershipMutationVariables = Exact<{
  roomId: string;
}>;

export type RevokeRoomMembershipMutation = {
  revokeRoomMembership: {
    __typename: 'RoomMembership';
    room: { __typename: 'Room'; id: string };
  };
};

export type RoomUserAliasByRoomIdQueryVariables = Exact<{
  roomId: string;
}>;

export type RoomUserAliasByRoomIdQuery = {
  roomUserAliasByRoomId: {
    __typename: 'RoomUserAlias';
    id: string | null;
    alias: string;
    seed: number;
  };
};

export type SetRoomUserAliasMutationVariables = Exact<{
  roomId: string;
  alias?: string | null;
  seed?: number | null;
}>;

export type SetRoomUserAliasMutation = {
  setRoomUserAlias: {
    __typename: 'RoomUserAlias';
    id: string | null;
    alias: string;
    seed: number;
  };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  currentUser: {
    __typename: 'User';
    id: string;
    verified: boolean;
    displayId: string | null;
    displayName: string | null;
    unverifiedMailAddress: string | null;
    language: string | null;
  } | null;
};

export type UserByDisplayIdQueryVariables = Exact<{
  displayId: string;
}>;

export type UserByDisplayIdQuery = {
  userByDisplayId: {
    __typename: 'User';
    id: string;
    verified: boolean;
    displayId: string | null;
    displayName: string | null;
  } | null;
};

export type CurrentUserWithSettingsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type CurrentUserWithSettingsQuery = {
  currentUser: {
    __typename: 'User';
    id: string;
    verified: boolean;
    displayId: string | null;
    displayName: string | null;
    mailAddress: string | null;
    unverifiedMailAddress: string | null;
    localPasswordSet: boolean | null;
    uiSettings: {
      __typename: 'UserUiSettings';
      contentAnswersDirectlyBelowChart: boolean | null;
      contentVisualizationUnitPercent: boolean | null;
      showContentResultsDirectly: boolean | null;
      rotateWordcloudItems: boolean | null;
    } | null;
  } | null;
};

export type ClaimUnverifiedUserMutationVariables = Exact<{
  mailAddress: string;
  password: string;
}>;

export type ClaimUnverifiedUserMutation = {
  claimUnverifiedUser: {
    __typename: 'User';
    id: string;
    displayId: string | null;
    unverifiedMailAddress: string | null;
  } | null;
};

export type VerifyUserMailAddressMutationVariables = Exact<{
  verificationCode: string;
}>;

export type VerifyUserMailAddressMutation = {
  verifyUserMailAddress: {
    __typename: 'User';
    id: string;
    displayId: string | null;
    unverifiedMailAddress: string | null;
  } | null;
};

export type VerifyUserMailAddressUnauthenticatedMutationVariables = Exact<{
  verificationCode: string;
  userId: string;
  password?: string | null;
}>;

export type VerifyUserMailAddressUnauthenticatedMutation = {
  verifyUserMailAddressUnauthenticated: {
    __typename: 'User';
    id: string;
    displayId: string | null;
    unverifiedMailAddress: string | null;
  } | null;
};

export type DeleteUserMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteUserMutation = { deleteUser: string | null };

export type UpdateUserSettingsMutationVariables = Exact<{
  contentAnswersDirectlyBelowChart?: boolean | null;
  contentVisualizationUnitPercent?: boolean | null;
  showContentResultsDirectly?: boolean | null;
  rotateWordcloudItems?: boolean | null;
}>;

export type UpdateUserSettingsMutation = {
  updateUserUiSettings: {
    __typename: 'UserUiSettings';
    contentAnswersDirectlyBelowChart: boolean | null;
    contentVisualizationUnitPercent: boolean | null;
    showContentResultsDirectly: boolean | null;
    rotateWordcloudItems: boolean | null;
  } | null;
};

export type RequestUserPasswordResetMutationVariables = Exact<{
  mailAddress: string;
}>;

export type RequestUserPasswordResetMutation = {
  requestUserPasswordReset: boolean | null;
};

export type RequestUserPasswordSetupMutationVariables = Exact<{
  [key: string]: never;
}>;

export type RequestUserPasswordSetupMutation = {
  requestUserPasswordSetup: boolean | null;
};

export type ResetUserPasswordMutationVariables = Exact<{
  mailAddress: string;
  password: string;
  verificationCode: string;
}>;

export type ResetUserPasswordMutation = {
  resetUserPassword: { __typename: 'User'; id: string } | null;
};

export type UpdateUserLanguageMutationVariables = Exact<{
  languageCode: string;
}>;

export type UpdateUserLanguageMutation = {
  updateUserLanguage: {
    __typename: 'User';
    id: string;
    language: string | null;
  } | null;
};

export type ResendVerificationMailMutationVariables = Exact<{
  [key: string]: never;
}>;

export type ResendVerificationMailMutation = {
  resendVerificationMail: boolean | null;
};

export type UpdateUserMailAddressMutationVariables = Exact<{
  mailAddress: string;
  password: string;
}>;

export type UpdateUserMailAddressMutation = {
  updateUserMailAddress: {
    __typename: 'User';
    id: string;
    unverifiedMailAddress: string | null;
  } | null;
};

export type UpdateUserPasswordMutationVariables = Exact<{
  oldPassword: string;
  newPassword: string;
}>;

export type UpdateUserPasswordMutation = {
  updateUserPassword: { __typename: 'User'; id: string } | null;
};

export const AdminUserDetailsFragmentDoc = gql`
  fragment AdminUserDetails on AdminUser {
    id
    username
    displayId
    mailAddress
    unverifiedMailAddress
    uiSettings {
      contentAnswersDirectlyBelowChart
      contentVisualizationUnitPercent
      showContentResultsDirectly
      rotateWordcloudItems
    }
    language
    verificationCode
    verificationErrors
    verificationExpiresAt
    createdAt
    updatedAt
    lastActivityAt
  }
`;
export const AdminRoomDetailsFragmentDoc = gql`
  fragment AdminRoomDetails on AdminRoom {
    id
    shortId
    name
    description
    descriptionRendered
    language
    focusModeEnabled
    createdBy
    createdAt
    updatedBy
    updatedAt
  }
`;
export const ReplyDetailsFragmentDoc = gql`
  fragment ReplyDetails on Reply {
    id
    body
    bodyRendered
    createdAt
  }
`;
export const PostDetailsFragmentDoc = gql`
  fragment PostDetails on Post {
    id
    body
    correct
    favorite
    createdAt
    tags {
      name
      id
    }
    replies {
      ...ReplyDetails
    }
    score
    userVote
    moderationState
  }
  ${ReplyDetailsFragmentDoc}
`;
export const QuestionnaireSummaryFragmentDoc = gql`
  fragment QuestionnaireSummary on Questionnaire {
    id
    name
    type
    published
    publishingMode
    publishedUpToContent {
      id
      position
    }
    leaderboardEnabled
    contentCount
  }
`;
export const RoundFragmentDoc = gql`
  fragment Round on Round {
    id
    contentId
    roundNo
    closed
    started
    answeringEndTime
    answerable
  }
`;
export const QuestionnaireDetailsFragmentDoc = gql`
  fragment QuestionnaireDetails on Questionnaire {
    id
    name
    type
    published
    publishingMode
    publishedUpToContent {
      id
      position
    }
    activeRound {
      ...Round
    }
    statisticsPublished
    correctOptionsPublished
    leaderboardEnabled
    contentCount
  }
  ${RoundFragmentDoc}
`;
export const ContentDetailsFragmentDoc = gql`
  fragment ContentDetails on Content {
    id
    body
    bodyRendered
    activeRound {
      ...Round
    }
    formatData {
      ... on BinaryContentFormatData {
        format
        correctAnswer
      }
      ... on ChoiceContentFormatData {
        format
        options {
          label
          labelRendered
        }
        correctOptionIndexes
        multiple
      }
      ... on NumericContentFormatData {
        format
        minNumber
        maxNumber
        correctNumber
        tolerance
      }
      ... on PrioritizationContentFormatData {
        format
        options {
          label
          labelRendered
        }
        assignablePoints
      }
      ... on ScaleContentFormatData {
        format
        template
        neutralOption
      }
      ... on ShortAnswerContentFormatData {
        format
        correctTerms
      }
      ... on SortContentFormatData {
        format
        correctOrder
        options {
          label
          labelRendered
        }
      }
      ... on TextContentFormatData {
        format
        answersPublished
      }
      ... on WordcloudContentFormatData {
        format
        maxAnswers
      }
      ... on FlashcardContentFormatData {
        format
        answer
      }
      ... on SlideContentFormatData {
        format
      }
    }
    duration
    abstentionsAllowed
    hasCorrectAnswer
    weight
    answerCount
    abstentionCount
    position
  }
  ${RoundFragmentDoc}
`;
export const CreatorContentDetailsFragmentDoc = gql`
  fragment CreatorContentDetails on Content {
    ...ContentDetails
    correctAnswerCount
    hasAnswers
  }
  ${ContentDetailsFragmentDoc}
`;
export const AnswerFragmentDoc = gql`
  fragment Answer on Answer {
    id
    result
    hidden
    formatData {
      ... on BinaryAnswerFormatData {
        format
        answer
      }
      ... on ChoiceAnswerFormatData {
        format
        selectedChoiceIndexes
      }
      ... on NumericAnswerFormatData {
        format
        selectedNumber
      }
      ... on PrioritizationAnswerFormatData {
        format
        assignedPoints
      }
      ... on ScaleAnswerFormatData {
        format
        rating
      }
      ... on ShortAnswerAnswerFormatData {
        format
        body
      }
      ... on SortAnswerFormatData {
        format
        selectedChoiceIndexes
      }
      ... on TextAnswerFormatData {
        format
        body
      }
      ... on WordcloudAnswerFormatData {
        format
        words
      }
    }
    createdAt
    durationMs
  }
`;
export const ContentAnswerResultFragmentDoc = gql`
  fragment ContentAnswerResult on ContentAnswerResult {
    contentId
    result
    durationMs
  }
`;
export const QuestionnaireAnswerResultFragmentDoc = gql`
  fragment QuestionnaireAnswerResult on QuestionnaireAnswerResult {
    correctAnswerCount
    scorableContentCount
    achievedScore
    maxScore
  }
`;
export const BinaryContentRoundStatsFragmentDoc = gql`
  fragment BinaryContentRoundStats on BinaryContentRoundStats {
    selectionCounts
  }
`;
export const ChoiceContentRoundStatsFragmentDoc = gql`
  fragment ChoiceContentRoundStats on ChoiceContentRoundStats {
    selectionCounts
  }
`;
export const NumericContentRoundStatsFragmentDoc = gql`
  fragment NumericContentRoundStats on NumericContentRoundStats {
    selectedNumbers
    counts
    mean
    median
    standardDeviation
    variance
    minimum
    maximum
    correctAnswerFraction
  }
`;
export const PrioritizationContentRoundStatsFragmentDoc = gql`
  fragment PrioritizationContentRoundStats on PrioritizationContentRoundStats {
    assignedPoints
  }
`;
export const ScaleContentRoundStatsFragmentDoc = gql`
  fragment ScaleContentRoundStats on ScaleContentRoundStats {
    counts
  }
`;
export const ShortAnswerContentRoundStatsFragmentDoc = gql`
  fragment ShortAnswerContentRoundStats on ShortAnswerContentRoundStats {
    texts
    counts
  }
`;
export const SortContentRoundStatsFragmentDoc = gql`
  fragment SortContentRoundStats on SortContentRoundStats {
    combinations {
      selectedChoiceIndexes
      count
    }
  }
`;
export const WordcloudContentRoundStatsFragmentDoc = gql`
  fragment WordcloudContentRoundStats on WordcloudContentRoundStats {
    words
    counts
  }
`;
export const RoomUserAliasFragmentDoc = gql`
  fragment RoomUserAlias on RoomUserAlias {
    id
    alias
    seed
  }
`;
export const LeaderboardEntryFragmentDoc = gql`
  fragment LeaderboardEntry on LeaderboardEntry {
    userAlias {
      ...RoomUserAlias
    }
    score
    position
    currentResult {
      points
      durationMs
      correct
    }
  }
  ${RoomUserAliasFragmentDoc}
`;
export const LeaderboardPageFragmentDoc = gql`
  fragment LeaderboardPage on LeaderboardPage {
    entries {
      ...LeaderboardEntry
    }
    ownEntry {
      ...LeaderboardEntry
    }
    totalCount
  }
  ${LeaderboardEntryFragmentDoc}
`;
export const RoomDetailsFragmentFragmentDoc = gql`
  fragment RoomDetailsFragment on Room {
    id
    shortId
    name
    description
    descriptionRendered
    language
    focusModeEnabled
  }
`;
export const RoomStatsFragmentDoc = gql`
  fragment RoomStats on RoomStats {
    id
    activeMemberCount
  }
`;
export const RoomMembershipFragmentDoc = gql`
  fragment RoomMembership on RoomMembership {
    room {
      ...RoomDetailsFragment
      stats {
        ...RoomStats
      }
    }
    role
  }
  ${RoomDetailsFragmentFragmentDoc}
  ${RoomStatsFragmentDoc}
`;
export const RoomMemberFragmentDoc = gql`
  fragment RoomMember on RoomMember {
    user {
      id
      displayId
      displayName
      verified
    }
    role
  }
`;
export const AdminUserByIdDocument = gql`
  query AdminUserById($id: ID!) {
    adminUserById(id: $id) {
      ...AdminUserDetails
    }
  }
  ${AdminUserDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminUserByIdGql extends Apollo.Query<
  AdminUserByIdQuery,
  AdminUserByIdQueryVariables
> {
  document = AdminUserByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminUsersDocument = gql`
  query AdminUsers(
    $search: String
    $exactSearchMode: Boolean
    $cursor: String
  ) {
    adminUsers(
      search: $search
      exactSearchMode: $exactSearchMode
      first: 50
      after: $cursor
    ) {
      edges {
        node {
          ...AdminUserDetails
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${AdminUserDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminUsersGql extends Apollo.Query<
  AdminUsersQuery,
  AdminUsersQueryVariables
> {
  document = AdminUsersDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminDeleteUserByIdDocument = gql`
  mutation AdminDeleteUserById($id: ID!) {
    adminDeleteUserById(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminDeleteUserByIdGql extends Apollo.Mutation<
  AdminDeleteUserByIdMutation,
  AdminDeleteUserByIdMutationVariables
> {
  document = AdminDeleteUserByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminCreateUserDocument = gql`
  mutation AdminCreateUser($mailAddress: String!) {
    adminCreateUser(mailAddress: $mailAddress) {
      ...AdminUserDetails
    }
  }
  ${AdminUserDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminCreateUserGql extends Apollo.Mutation<
  AdminCreateUserMutation,
  AdminCreateUserMutationVariables
> {
  document = AdminCreateUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminVerifyUserByIdDocument = gql`
  mutation AdminVerifyUserById($id: ID!) {
    adminVerifyUserById(id: $id) {
      ...AdminUserDetails
    }
  }
  ${AdminUserDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminVerifyUserByIdGql extends Apollo.Mutation<
  AdminVerifyUserByIdMutation,
  AdminVerifyUserByIdMutationVariables
> {
  document = AdminVerifyUserByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomByIdDocument = gql`
  query AdminRoomById($id: ID!) {
    adminRoomById(id: $id) {
      ...AdminRoomDetails
    }
  }
  ${AdminRoomDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomByIdGql extends Apollo.Query<
  AdminRoomByIdQuery,
  AdminRoomByIdQueryVariables
> {
  document = AdminRoomByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomsDocument = gql`
  query AdminRooms($search: String, $cursor: String) {
    adminRooms(search: $search, first: 50, after: $cursor) {
      edges {
        node {
          ...AdminRoomDetails
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${AdminRoomDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomsGql extends Apollo.Query<
  AdminRoomsQuery,
  AdminRoomsQueryVariables
> {
  document = AdminRoomsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomManagingMembersByRoomIdDocument = gql`
  query AdminRoomManagingMembersByRoomId($roomId: UUID!) {
    adminRoomManagingMembersByRoomId(roomId: $roomId) {
      ...RoomMember
    }
  }
  ${RoomMemberFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomManagingMembersByRoomIdGql extends Apollo.Query<
  AdminRoomManagingMembersByRoomIdQuery,
  AdminRoomManagingMembersByRoomIdQueryVariables
> {
  document = AdminRoomManagingMembersByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminDeleteRoomByIdDocument = gql`
  mutation AdminDeleteRoomById($id: ID!) {
    adminDeleteRoomById(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminDeleteRoomByIdGql extends Apollo.Mutation<
  AdminDeleteRoomByIdMutation,
  AdminDeleteRoomByIdMutationVariables
> {
  document = AdminDeleteRoomByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminTransferRoomDocument = gql`
  mutation AdminTransferRoom($roomId: ID!, $userId: ID!) {
    adminTransferRoom(roomId: $roomId, userId: $userId) {
      ...AdminRoomDetails
    }
  }
  ${AdminRoomDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminTransferRoomGql extends Apollo.Mutation<
  AdminTransferRoomMutation,
  AdminTransferRoomMutationVariables
> {
  document = AdminTransferRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminStatsDocument = gql`
  query AdminStats {
    adminUserStats {
      totalCount
      verifiedCount
      pendingCount
    }
    adminRoomStats {
      totalCount
      membershipCount
      managingUserCount
      participantCount
    }
    adminAnnouncementStats {
      totalCount
    }
    adminQnaStats {
      postCount
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminStatsGql extends Apollo.Query<
  AdminStatsQuery,
  AdminStatsQueryVariables
> {
  document = AdminStatsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomActivityStatsDocument = gql`
  query AdminRoomActivityStats($from: DateTime!, $to: DateTime!) {
    adminRoomActivityStats(from: $from, to: $to) {
      managingUserCount
      participantCount
      roomCount
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomActivityStatsGql extends Apollo.Query<
  AdminRoomActivityStatsQuery,
  AdminRoomActivityStatsQueryVariables
> {
  document = AdminRoomActivityStatsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ActiveRoomStatsDocument = gql`
  query ActiveRoomStats($minMemberCount: Int, $activityWindowMinutes: Int) {
    adminActiveRoomStats(
      minMemberCount: $minMemberCount
      activityWindowMinutes: $activityWindowMinutes
    ) {
      count
      minMemberCount
      activityWindowMinutes
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ActiveRoomStatsGql extends Apollo.Query<
  ActiveRoomStatsQuery,
  ActiveRoomStatsQueryVariables
> {
  document = ActiveRoomStatsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminUserCountDocument = gql`
  query AdminUserCount {
    adminUserStats {
      verifiedCount
      pendingCount
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminUserCountGql extends Apollo.Query<
  AdminUserCountQuery,
  AdminUserCountQueryVariables
> {
  document = AdminUserCountDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomCountDocument = gql`
  query AdminRoomCount {
    adminRoomStats {
      totalCount
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomCountGql extends Apollo.Query<
  AdminRoomCountQuery,
  AdminRoomCountQueryVariables
> {
  document = AdminRoomCountDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AdminRoomMembershipsByUserIdDocument = gql`
  query AdminRoomMembershipsByUserId($userId: UUID!) {
    adminRoomMembershipsByUserId(userId: $userId) {
      edges {
        node {
          ...RoomMembership
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomMembershipsByUserIdGql extends Apollo.Query<
  AdminRoomMembershipsByUserIdQuery,
  AdminRoomMembershipsByUserIdQueryVariables
> {
  document = AdminRoomMembershipsByUserIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AnnouncementsMetaForCurrentUserDocument = gql`
  query AnnouncementsMetaForCurrentUser {
    announcementsMetaForCurrentUser {
      count
      readAt
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsMetaForCurrentUserGql extends Apollo.Query<
  AnnouncementsMetaForCurrentUserQuery,
  AnnouncementsMetaForCurrentUserQueryVariables
> {
  document = AnnouncementsMetaForCurrentUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AnnoucentmentsByRoomIdDocument = gql`
  query AnnoucentmentsByRoomId($roomId: UUID!) {
    announcementsByRoomId(roomId: $roomId) {
      edges {
        node {
          id
          body
          bodyRendered
          createdAt
          updatedAt
          title
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AnnoucentmentsByRoomIdGql extends Apollo.Query<
  AnnoucentmentsByRoomIdQuery,
  AnnoucentmentsByRoomIdQueryVariables
> {
  document = AnnoucentmentsByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AnnouncementsForCurrentUserDocument = gql`
  query AnnouncementsForCurrentUser {
    announcementsForCurrentUser {
      edges {
        node {
          body
          bodyRendered
          createdAt
          updatedAt
          id
          title
          room {
            id
            name
          }
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsForCurrentUserGql extends Apollo.Query<
  AnnouncementsForCurrentUserQuery,
  AnnouncementsForCurrentUserQueryVariables
> {
  document = AnnouncementsForCurrentUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateAnnouncementDocument = gql`
  mutation CreateAnnouncement($roomId: UUID!, $title: String!, $body: String!) {
    createAnnouncement(input: { roomId: $roomId, title: $title, body: $body }) {
      body
      bodyRendered
      createdAt
      title
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CreateAnnouncementGql extends Apollo.Mutation<
  CreateAnnouncementMutation,
  CreateAnnouncementMutationVariables
> {
  document = CreateAnnouncementDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateAnnouncementDocument = gql`
  mutation UpdateAnnouncement($id: ID!, $title: String, $body: String) {
    updateAnnouncement(input: { id: $id, title: $title, body: $body }) {
      body
      bodyRendered
      updatedAt
      title
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateAnnouncementGql extends Apollo.Mutation<
  UpdateAnnouncementMutation,
  UpdateAnnouncementMutationVariables
> {
  document = UpdateAnnouncementDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteAnnouncementDocument = gql`
  mutation DeleteAnnouncement($id: ID!) {
    deleteAnnouncement(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteAnnouncementGql extends Apollo.Mutation<
  DeleteAnnouncementMutation,
  DeleteAnnouncementMutationVariables
> {
  document = DeleteAnnouncementDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnasByRoomIdDocument = gql`
  query QnasByRoomId($roomId: UUID!) {
    qnasByRoomId(roomId: $roomId) {
      edges {
        node {
          id
          topic
          state
          autoPublish
          threshold
          activePost {
            id
            body
            createdAt
          }
          tags {
            id
            name
          }
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnasByRoomIdGql extends Apollo.Query<
  QnasByRoomIdQuery,
  QnasByRoomIdQueryVariables
> {
  document = QnasByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const StartQnaDocument = gql`
  mutation StartQna($id: ID!) {
    startQna(id: $id) {
      id
      state
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class StartQnaGql extends Apollo.Mutation<
  StartQnaMutation,
  StartQnaMutationVariables
> {
  document = StartQnaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const PauseQnaDocument = gql`
  mutation PauseQna($id: ID!) {
    pauseQna(id: $id) {
      id
      state
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class PauseQnaGql extends Apollo.Mutation<
  PauseQnaMutation,
  PauseQnaMutationVariables
> {
  document = PauseQnaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const StopQnaDocument = gql`
  mutation StopQna($id: ID!) {
    stopQna(id: $id) {
      id
      state
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class StopQnaGql extends Apollo.Mutation<
  StopQnaMutation,
  StopQnaMutationVariables
> {
  document = StopQnaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaAutoPublishDocument = gql`
  mutation UpdateQnaAutoPublish($id: ID!, $autoPublish: Boolean!) {
    updateQnaAutoPublish(id: $id, autoPublish: $autoPublish) {
      id
      autoPublish
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaAutoPublishGql extends Apollo.Mutation<
  UpdateQnaAutoPublishMutation,
  UpdateQnaAutoPublishMutationVariables
> {
  document = UpdateQnaAutoPublishDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaThresholdDocument = gql`
  mutation UpdateQnaThreshold($id: ID!, $threshold: Int) {
    updateQnaThreshold(id: $id, threshold: $threshold) {
      id
      threshold
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaThresholdGql extends Apollo.Mutation<
  UpdateQnaThresholdMutation,
  UpdateQnaThresholdMutationVariables
> {
  document = UpdateQnaThresholdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaActivePostIdDocument = gql`
  mutation UpdateQnaActivePostId($id: ID!, $activePostId: UUID) {
    updateQnaActivePostId(id: $id, activePostId: $activePostId) {
      id
      activePost {
        id
        body
        createdAt
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaActivePostIdGql extends Apollo.Mutation<
  UpdateQnaActivePostIdMutation,
  UpdateQnaActivePostIdMutationVariables
> {
  document = UpdateQnaActivePostIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostsByQnaIdDocument = gql`
  query QnaPostsByQnaId($query: PostQueryInput, $cursor: String) {
    qnaPostsByQnaId(query: $query, first: 20, after: $cursor) {
      edges {
        node {
          ...PostDetails
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${PostDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostsByQnaIdGql extends Apollo.Query<
  QnaPostsByQnaIdQuery,
  QnaPostsByQnaIdQueryVariables
> {
  document = QnaPostsByQnaIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostCountsByQnaIdDocument = gql`
  query QnaPostCountsByQnaId($qnaId: UUID!) {
    qnaPostCountsByQnaId(qnaId: $qnaId) {
      accepted
      rejected
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostCountsByQnaIdGql extends Apollo.Query<
  QnaPostCountsByQnaIdQuery,
  QnaPostCountsByQnaIdQueryVariables
> {
  document = QnaPostCountsByQnaIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostCountSummaryDocument = gql`
  subscription QnaPostCountSummary($qnaId: UUID!) {
    qnaPostCountSummary(qnaId: $qnaId) {
      accepted
      rejected
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostCountSummaryGql extends Apollo.Subscription<
  QnaPostCountSummarySubscription,
  QnaPostCountSummarySubscriptionVariables
> {
  document = QnaPostCountSummaryDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQnaPostDocument = gql`
  mutation CreateQnaPost($qnaId: UUID!, $body: String!, $tagIds: [UUID!]) {
    createQnaPost(input: { qnaId: $qnaId, body: $body, tagIds: $tagIds }) {
      id
      body
      correct
      favorite
      createdAt
      tags {
        id
        name
      }
      score
      userVote
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQnaPostGql extends Apollo.Mutation<
  CreateQnaPostMutation,
  CreateQnaPostMutationVariables
> {
  document = CreateQnaPostDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaPostFavoriteDocument = gql`
  mutation UpdateQnaPostFavorite($id: ID!, $favorite: Boolean!) {
    updateQnaPostFavorite(id: $id, favorite: $favorite) {
      id
      favorite
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaPostFavoriteGql extends Apollo.Mutation<
  UpdateQnaPostFavoriteMutation,
  UpdateQnaPostFavoriteMutationVariables
> {
  document = UpdateQnaPostFavoriteDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaPostCorrectDocument = gql`
  mutation UpdateQnaPostCorrect($id: ID!, $correct: CorrectState!) {
    updateQnaPostCorrect(id: $id, correct: $correct) {
      id
      correct
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaPostCorrectGql extends Apollo.Mutation<
  UpdateQnaPostCorrectMutation,
  UpdateQnaPostCorrectMutationVariables
> {
  document = UpdateQnaPostCorrectDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AcceptQnaPostDocument = gql`
  mutation AcceptQnaPost($id: ID!) {
    acceptQnaPost(id: $id) {
      id
      moderationState
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AcceptQnaPostGql extends Apollo.Mutation<
  AcceptQnaPostMutation,
  AcceptQnaPostMutationVariables
> {
  document = AcceptQnaPostDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RejectQnaPostDocument = gql`
  mutation RejectQnaPost($id: ID!) {
    rejectQnaPost(id: $id) {
      id
      moderationState
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RejectQnaPostGql extends Apollo.Mutation<
  RejectQnaPostMutation,
  RejectQnaPostMutationVariables
> {
  document = RejectQnaPostDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQnaPostDocument = gql`
  mutation DeleteQnaPost($id: ID!) {
    deleteQnaPost(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQnaPostGql extends Apollo.Mutation<
  DeleteQnaPostMutation,
  DeleteQnaPostMutationVariables
> {
  document = DeleteQnaPostDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQnaPostsDocument = gql`
  mutation DeleteQnaPosts($qnaId: UUID!, $moderationState: ModerationState) {
    deleteQnaPostsByQnaId(qnaId: $qnaId, moderationState: $moderationState)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQnaPostsGql extends Apollo.Mutation<
  DeleteQnaPostsMutation,
  DeleteQnaPostsMutationVariables
> {
  document = DeleteQnaPostsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQnaTagDocument = gql`
  mutation CreateQnaTag($qnaId: UUID!, $name: String!) {
    createQnaTag(input: { qnaId: $qnaId, name: $name }) {
      id
      name
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQnaTagGql extends Apollo.Mutation<
  CreateQnaTagMutation,
  CreateQnaTagMutationVariables
> {
  document = CreateQnaTagDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQnaTagDocument = gql`
  mutation DeleteQnaTag($id: ID!) {
    deleteQnaTag(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQnaTagGql extends Apollo.Mutation<
  DeleteQnaTagMutation,
  DeleteQnaTagMutationVariables
> {
  document = DeleteQnaTagDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQnaReplyDocument = gql`
  mutation CreateQnaReply($postId: UUID!, $body: String!) {
    createQnaReply(input: { postId: $postId, body: $body }) {
      ...ReplyDetails
    }
  }
  ${ReplyDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQnaReplyGql extends Apollo.Mutation<
  CreateQnaReplyMutation,
  CreateQnaReplyMutationVariables
> {
  document = CreateQnaReplyDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQnaReplyDocument = gql`
  mutation UpdateQnaReply($id: ID!, $body: String!) {
    updateQnaReply(id: $id, body: $body) {
      ...ReplyDetails
    }
  }
  ${ReplyDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQnaReplyGql extends Apollo.Mutation<
  UpdateQnaReplyMutation,
  UpdateQnaReplyMutationVariables
> {
  document = UpdateQnaReplyDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQnaReplyDocument = gql`
  mutation DeleteQnaReply($id: ID!) {
    deleteQnaReply(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQnaReplyGql extends Apollo.Mutation<
  DeleteQnaReplyMutation,
  DeleteQnaReplyMutationVariables
> {
  document = DeleteQnaReplyDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const VoteQnaPostDocument = gql`
  mutation VoteQnaPost($postId: UUID!, $value: Int!) {
    voteQnaPost(input: { postId: $postId, value: $value }) {
      id
      score
      userVote
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class VoteQnaPostGql extends Apollo.Mutation<
  VoteQnaPostMutation,
  VoteQnaPostMutationVariables
> {
  document = VoteQnaPostDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaStateChangedDocument = gql`
  subscription QnaStateChanged($roomId: UUID!) {
    qnaStateChanged(roomId: $roomId) {
      id
      state
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaStateChangedGql extends Apollo.Subscription<
  QnaStateChangedSubscription,
  QnaStateChangedSubscriptionVariables
> {
  document = QnaStateChangedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ActiveQnaPostUpdatedDocument = gql`
  subscription ActiveQnaPostUpdated($roomId: UUID!) {
    activeQnaPostUpdated(roomId: $roomId) {
      id
      activePost {
        id
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ActiveQnaPostUpdatedGql extends Apollo.Subscription<
  ActiveQnaPostUpdatedSubscription,
  ActiveQnaPostUpdatedSubscriptionVariables
> {
  document = ActiveQnaPostUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostCreatedDocument = gql`
  subscription QnaPostCreated($qnaId: UUID!) {
    qnaPostCreated(qnaId: $qnaId) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostCreatedGql extends Apollo.Subscription<
  QnaPostCreatedSubscription,
  QnaPostCreatedSubscriptionVariables
> {
  document = QnaPostCreatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostDeletedDocument = gql`
  subscription QnaPostDeleted($qnaId: UUID!) {
    qnaPostDeleted(qnaId: $qnaId) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostDeletedGql extends Apollo.Subscription<
  QnaPostDeletedSubscription,
  QnaPostDeletedSubscriptionVariables
> {
  document = QnaPostDeletedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostAcceptedDocument = gql`
  subscription QnaPostAccepted($qnaId: UUID!) {
    qnaPostAccepted(qnaId: $qnaId) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostAcceptedGql extends Apollo.Subscription<
  QnaPostAcceptedSubscription,
  QnaPostAcceptedSubscriptionVariables
> {
  document = QnaPostAcceptedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostRejectedDocument = gql`
  subscription QnaPostRejected($qnaId: UUID!) {
    qnaPostRejected(qnaId: $qnaId) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostRejectedGql extends Apollo.Subscription<
  QnaPostRejectedSubscription,
  QnaPostRejectedSubscriptionVariables
> {
  document = QnaPostRejectedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostRepliedDocument = gql`
  subscription QnaPostReplied($qnaId: UUID!) {
    qnaPostReplied(qnaId: $qnaId) {
      postId
      reply {
        ...ReplyDetails
      }
    }
  }
  ${ReplyDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostRepliedGql extends Apollo.Subscription<
  QnaPostRepliedSubscription,
  QnaPostRepliedSubscriptionVariables
> {
  document = QnaPostRepliedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostMarkedFavoriteDocument = gql`
  subscription QnaPostMarkedFavorite($qnaId: UUID!) {
    qnaPostMarkedFavorite(qnaId: $qnaId) {
      id
      favorite
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostMarkedFavoriteGql extends Apollo.Subscription<
  QnaPostMarkedFavoriteSubscription,
  QnaPostMarkedFavoriteSubscriptionVariables
> {
  document = QnaPostMarkedFavoriteDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostMarkedCorrectDocument = gql`
  subscription QnaPostMarkedCorrect($qnaId: UUID!) {
    qnaPostMarkedCorrect(qnaId: $qnaId) {
      id
      correct
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostMarkedCorrectGql extends Apollo.Subscription<
  QnaPostMarkedCorrectSubscription,
  QnaPostMarkedCorrectSubscriptionVariables
> {
  document = QnaPostMarkedCorrectDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QnaPostVotedDocument = gql`
  subscription QnaPostVoted($qnaId: UUID!) {
    qnaPostVoted(qnaId: $qnaId) {
      id
      score
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QnaPostVotedGql extends Apollo.Subscription<
  QnaPostVotedSubscription,
  QnaPostVotedSubscriptionVariables
> {
  document = QnaPostVotedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnairesByRoomIdDocument = gql`
  query QuestionnairesByRoomId($roomId: UUID!) {
    questionnairesByRoomId(roomId: $roomId) {
      ...QuestionnaireSummary
    }
  }
  ${QuestionnaireSummaryFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnairesByRoomIdGql extends Apollo.Query<
  QuestionnairesByRoomIdQuery,
  QuestionnairesByRoomIdQueryVariables
> {
  document = QuestionnairesByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const PublishedQuestionnairesByRoomIdDocument = gql`
  query PublishedQuestionnairesByRoomId($roomId: UUID!) {
    publishedQuestionnairesByRoomId(roomId: $roomId) {
      ...QuestionnaireSummary
    }
  }
  ${QuestionnaireSummaryFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class PublishedQuestionnairesByRoomIdGql extends Apollo.Query<
  PublishedQuestionnairesByRoomIdQuery,
  PublishedQuestionnairesByRoomIdQueryVariables
> {
  document = PublishedQuestionnairesByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnairesChangedDocument = gql`
  subscription QuestionnairesChanged($roomId: UUID!) {
    questionnairesChanged(roomId: $roomId)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnairesChangedGql extends Apollo.Subscription<
  QuestionnairesChangedSubscription,
  QuestionnairesChangedSubscriptionVariables
> {
  document = QuestionnairesChangedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireByIdDocument = gql`
  query QuestionnaireById($id: UUID!) {
    questionnaireById(id: $id) {
      ...QuestionnaireDetails
    }
  }
  ${QuestionnaireDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireByIdGql extends Apollo.Query<
  QuestionnaireByIdQuery,
  QuestionnaireByIdQueryVariables
> {
  document = QuestionnaireByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireContentsByQuestionnaireIdDocument = gql`
  query QuestionnaireContentsByQuestionnaireId($questionnaireId: UUID!) {
    questionnaireContentsByQuestionnaireId(questionnaireId: $questionnaireId) {
      edges {
        node {
          ...CreatorContentDetails
        }
      }
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireContentsByQuestionnaireIdGql extends Apollo.Query<
  QuestionnaireContentsByQuestionnaireIdQuery,
  QuestionnaireContentsByQuestionnaireIdQueryVariables
> {
  document = QuestionnaireContentsByQuestionnaireIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnairePublishedContentsByQuestionnaireIdDocument = gql`
  query QuestionnairePublishedContentsByQuestionnaireId(
    $questionnaireId: UUID!
  ) {
    questionnairePublishedContentsByQuestionnaireId(
      questionnaireId: $questionnaireId
    ) {
      edges {
        node {
          ...ContentDetails
        }
      }
    }
  }
  ${ContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnairePublishedContentsByQuestionnaireIdGql extends Apollo.Query<
  QuestionnairePublishedContentsByQuestionnaireIdQuery,
  QuestionnairePublishedContentsByQuestionnaireIdQueryVariables
> {
  document = QuestionnairePublishedContentsByQuestionnaireIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireDocument = gql`
  mutation CreateQuestionnaire($input: CreateQuestionnaireInput!) {
    createQuestionnaire(input: $input) {
      ...QuestionnaireDetails
    }
  }
  ${QuestionnaireDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireGql extends Apollo.Mutation<
  CreateQuestionnaireMutation,
  CreateQuestionnaireMutationVariables
> {
  document = CreateQuestionnaireDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ToggleQuestionnairePublishedDocument = gql`
  mutation ToggleQuestionnairePublished($id: UUID!, $published: Boolean!) {
    toggleQuestionnairePublished(id: $id, published: $published) {
      ...QuestionnaireDetails
    }
  }
  ${QuestionnaireDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class ToggleQuestionnairePublishedGql extends Apollo.Mutation<
  ToggleQuestionnairePublishedMutation,
  ToggleQuestionnairePublishedMutationVariables
> {
  document = ToggleQuestionnairePublishedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireBinaryContentDocument = gql`
  mutation CreateQuestionnaireBinaryContent($input: CreateBinaryContentInput!) {
    createQuestionnaireBinaryContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireBinaryContentGql extends Apollo.Mutation<
  CreateQuestionnaireBinaryContentMutation,
  CreateQuestionnaireBinaryContentMutationVariables
> {
  document = CreateQuestionnaireBinaryContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireBinaryContentDocument = gql`
  mutation UpdateQuestionnaireBinaryContent($input: UpdateBinaryContentInput!) {
    updateQuestionnaireBinaryContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireBinaryContentGql extends Apollo.Mutation<
  UpdateQuestionnaireBinaryContentMutation,
  UpdateQuestionnaireBinaryContentMutationVariables
> {
  document = UpdateQuestionnaireBinaryContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireChoiceContentDocument = gql`
  mutation CreateQuestionnaireChoiceContent($input: CreateChoiceContentInput!) {
    createQuestionnaireChoiceContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireChoiceContentGql extends Apollo.Mutation<
  CreateQuestionnaireChoiceContentMutation,
  CreateQuestionnaireChoiceContentMutationVariables
> {
  document = CreateQuestionnaireChoiceContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireChoiceContentDocument = gql`
  mutation UpdateQuestionnaireChoiceContent($input: UpdateChoiceContentInput!) {
    updateQuestionnaireChoiceContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireChoiceContentGql extends Apollo.Mutation<
  UpdateQuestionnaireChoiceContentMutation,
  UpdateQuestionnaireChoiceContentMutationVariables
> {
  document = UpdateQuestionnaireChoiceContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireNumericContentDocument = gql`
  mutation CreateQuestionnaireNumericContent(
    $input: CreateNumericContentInput!
  ) {
    createQuestionnaireNumericContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireNumericContentGql extends Apollo.Mutation<
  CreateQuestionnaireNumericContentMutation,
  CreateQuestionnaireNumericContentMutationVariables
> {
  document = CreateQuestionnaireNumericContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireNumericContentDocument = gql`
  mutation UpdateQuestionnaireNumericContent(
    $input: UpdateNumericContentInput!
  ) {
    updateQuestionnaireNumericContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireNumericContentGql extends Apollo.Mutation<
  UpdateQuestionnaireNumericContentMutation,
  UpdateQuestionnaireNumericContentMutationVariables
> {
  document = UpdateQuestionnaireNumericContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnairePrioritizationContentDocument = gql`
  mutation CreateQuestionnairePrioritizationContent(
    $input: CreatePrioritizationContentInput!
  ) {
    createQuestionnairePrioritizationContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnairePrioritizationContentGql extends Apollo.Mutation<
  CreateQuestionnairePrioritizationContentMutation,
  CreateQuestionnairePrioritizationContentMutationVariables
> {
  document = CreateQuestionnairePrioritizationContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnairePrioritizationContentDocument = gql`
  mutation UpdateQuestionnairePrioritizationContent(
    $input: UpdatePrioritizationContentInput!
  ) {
    updateQuestionnairePrioritizationContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnairePrioritizationContentGql extends Apollo.Mutation<
  UpdateQuestionnairePrioritizationContentMutation,
  UpdateQuestionnairePrioritizationContentMutationVariables
> {
  document = UpdateQuestionnairePrioritizationContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireScaleContentDocument = gql`
  mutation CreateQuestionnaireScaleContent($input: CreateScaleContentInput!) {
    createQuestionnaireScaleContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireScaleContentGql extends Apollo.Mutation<
  CreateQuestionnaireScaleContentMutation,
  CreateQuestionnaireScaleContentMutationVariables
> {
  document = CreateQuestionnaireScaleContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireScaleContentDocument = gql`
  mutation UpdateQuestionnaireScaleContent($input: UpdateScaleContentInput!) {
    updateQuestionnaireScaleContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireScaleContentGql extends Apollo.Mutation<
  UpdateQuestionnaireScaleContentMutation,
  UpdateQuestionnaireScaleContentMutationVariables
> {
  document = UpdateQuestionnaireScaleContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireShortAnswerContentDocument = gql`
  mutation CreateQuestionnaireShortAnswerContent(
    $input: CreateShortAnswerContentInput!
  ) {
    createQuestionnaireShortAnswerContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireShortAnswerContentGql extends Apollo.Mutation<
  CreateQuestionnaireShortAnswerContentMutation,
  CreateQuestionnaireShortAnswerContentMutationVariables
> {
  document = CreateQuestionnaireShortAnswerContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireShortAnswerContentDocument = gql`
  mutation UpdateQuestionnaireShortAnswerContent(
    $input: UpdateShortAnswerContentInput!
  ) {
    updateQuestionnaireShortAnswerContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireShortAnswerContentGql extends Apollo.Mutation<
  UpdateQuestionnaireShortAnswerContentMutation,
  UpdateQuestionnaireShortAnswerContentMutationVariables
> {
  document = UpdateQuestionnaireShortAnswerContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireSortContentDocument = gql`
  mutation CreateQuestionnaireSortContent($input: CreateSortContentInput!) {
    createQuestionnaireSortContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireSortContentGql extends Apollo.Mutation<
  CreateQuestionnaireSortContentMutation,
  CreateQuestionnaireSortContentMutationVariables
> {
  document = CreateQuestionnaireSortContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireSortContentDocument = gql`
  mutation UpdateQuestionnaireSortContent($input: UpdateSortContentInput!) {
    updateQuestionnaireSortContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireSortContentGql extends Apollo.Mutation<
  UpdateQuestionnaireSortContentMutation,
  UpdateQuestionnaireSortContentMutationVariables
> {
  document = UpdateQuestionnaireSortContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireWordcloudContentDocument = gql`
  mutation CreateQuestionnaireWordcloudContent(
    $input: CreateWordcloudContentInput!
  ) {
    createQuestionnaireWordcloudContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireWordcloudContentGql extends Apollo.Mutation<
  CreateQuestionnaireWordcloudContentMutation,
  CreateQuestionnaireWordcloudContentMutationVariables
> {
  document = CreateQuestionnaireWordcloudContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireWordcloudContentDocument = gql`
  mutation UpdateQuestionnaireWordcloudContent(
    $input: UpdateWordcloudContentInput!
  ) {
    updateQuestionnaireWordcloudContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireWordcloudContentGql extends Apollo.Mutation<
  UpdateQuestionnaireWordcloudContentMutation,
  UpdateQuestionnaireWordcloudContentMutationVariables
> {
  document = UpdateQuestionnaireWordcloudContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireTextContentDocument = gql`
  mutation CreateQuestionnaireTextContent($input: CreateTextContentInput!) {
    createQuestionnaireTextContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireTextContentGql extends Apollo.Mutation<
  CreateQuestionnaireTextContentMutation,
  CreateQuestionnaireTextContentMutationVariables
> {
  document = CreateQuestionnaireTextContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireTextContentDocument = gql`
  mutation UpdateQuestionnaireTextContent($input: UpdateTextContentInput!) {
    updateQuestionnaireTextContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireTextContentGql extends Apollo.Mutation<
  UpdateQuestionnaireTextContentMutation,
  UpdateQuestionnaireTextContentMutationVariables
> {
  document = UpdateQuestionnaireTextContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireFlashcardContentDocument = gql`
  mutation CreateQuestionnaireFlashcardContent(
    $input: CreateFlashcardContentInput!
  ) {
    createQuestionnaireFlashcardContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireFlashcardContentGql extends Apollo.Mutation<
  CreateQuestionnaireFlashcardContentMutation,
  CreateQuestionnaireFlashcardContentMutationVariables
> {
  document = CreateQuestionnaireFlashcardContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireFlashcardContentDocument = gql`
  mutation UpdateQuestionnaireFlashcardContent(
    $input: UpdateFlashcardContentInput!
  ) {
    updateQuestionnaireFlashcardContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireFlashcardContentGql extends Apollo.Mutation<
  UpdateQuestionnaireFlashcardContentMutation,
  UpdateQuestionnaireFlashcardContentMutationVariables
> {
  document = UpdateQuestionnaireFlashcardContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireSlideContentDocument = gql`
  mutation CreateQuestionnaireSlideContent($input: CreateSlideContentInput!) {
    createQuestionnaireSlideContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireSlideContentGql extends Apollo.Mutation<
  CreateQuestionnaireSlideContentMutation,
  CreateQuestionnaireSlideContentMutationVariables
> {
  document = CreateQuestionnaireSlideContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireSlideContentDocument = gql`
  mutation UpdateQuestionnaireSlideContent($input: UpdateSlideContentInput!) {
    updateQuestionnaireSlideContent(input: $input) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireSlideContentGql extends Apollo.Mutation<
  UpdateQuestionnaireSlideContentMutation,
  UpdateQuestionnaireSlideContentMutationVariables
> {
  document = UpdateQuestionnaireSlideContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireContentByIdDocument = gql`
  query QuestionnaireContentById($id: UUID!) {
    questionnaireContentById(id: $id) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireContentByIdGql extends Apollo.Query<
  QuestionnaireContentByIdQuery,
  QuestionnaireContentByIdQueryVariables
> {
  document = QuestionnaireContentByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireAnswerByRoundIdDocument = gql`
  query QuestionnaireAnswerByRoundId($roundId: UUID!) {
    questionnaireAnswerByRoundId(roundId: $roundId) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireAnswerByRoundIdGql extends Apollo.Query<
  QuestionnaireAnswerByRoundIdQuery,
  QuestionnaireAnswerByRoundIdQueryVariables
> {
  document = QuestionnaireAnswerByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireContentAnswerResultsByQuestionnaireIdDocument = gql`
  query QuestionnaireContentAnswerResultsByQuestionnaireId(
    $questionnaireId: UUID!
  ) {
    questionnaireContentAnswerResultsByQuestionnaireId(
      questionnaireId: $questionnaireId
    ) {
      ...ContentAnswerResult
    }
  }
  ${ContentAnswerResultFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireContentAnswerResultsByQuestionnaireIdGql extends Apollo.Query<
  QuestionnaireContentAnswerResultsByQuestionnaireIdQuery,
  QuestionnaireContentAnswerResultsByQuestionnaireIdQueryVariables
> {
  document = QuestionnaireContentAnswerResultsByQuestionnaireIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireAnswerResultsByQuestionnaireIdDocument = gql`
  query QuestionnaireAnswerResultsByQuestionnaireId($questionnaireId: UUID!) {
    questionnaireAnswerResultsByQuestionnaireId(
      questionnaireId: $questionnaireId
    ) {
      ...QuestionnaireAnswerResult
    }
  }
  ${QuestionnaireAnswerResultFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireAnswerResultsByQuestionnaireIdGql extends Apollo.Query<
  QuestionnaireAnswerResultsByQuestionnaireIdQuery,
  QuestionnaireAnswerResultsByQuestionnaireIdQueryVariables
> {
  document = QuestionnaireAnswerResultsByQuestionnaireIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireLeaderboardByQuestionnaireIdDocument = gql`
  query QuestionnaireLeaderboardByQuestionnaireId(
    $questionnaireId: UUID!
    $contentId: UUID
    $limit: Int
  ) {
    questionnaireLeaderboardByQuestionnaireId(
      questionnaireId: $questionnaireId
      contentId: $contentId
      limit: $limit
    ) {
      ...LeaderboardPage
    }
  }
  ${LeaderboardPageFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireLeaderboardByQuestionnaireIdGql extends Apollo.Query<
  QuestionnaireLeaderboardByQuestionnaireIdQuery,
  QuestionnaireLeaderboardByQuestionnaireIdQueryVariables
> {
  document = QuestionnaireLeaderboardByQuestionnaireIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireBinaryRoundStatsByRoundIdDocument = gql`
  query QuestionnaireBinaryRoundStatsByRoundId($roundId: UUID!) {
    questionnaireBinaryRoundStatsByRoundId(roundId: $roundId) {
      ...BinaryContentRoundStats
    }
  }
  ${BinaryContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireBinaryRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireBinaryRoundStatsByRoundIdQuery,
  QuestionnaireBinaryRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireBinaryRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireChoiceRoundStatsByRoundIdDocument = gql`
  query QuestionnaireChoiceRoundStatsByRoundId($roundId: UUID!) {
    questionnaireChoiceRoundStatsByRoundId(roundId: $roundId) {
      ...ChoiceContentRoundStats
    }
  }
  ${ChoiceContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireChoiceRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireChoiceRoundStatsByRoundIdQuery,
  QuestionnaireChoiceRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireChoiceRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireNumericRoundStatsByRoundIdDocument = gql`
  query QuestionnaireNumericRoundStatsByRoundId($roundId: UUID!) {
    questionnaireNumericRoundStatsByRoundId(roundId: $roundId) {
      ...NumericContentRoundStats
    }
  }
  ${NumericContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireNumericRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireNumericRoundStatsByRoundIdQuery,
  QuestionnaireNumericRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireNumericRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnairePrioritizationRoundStatsByRoundIdDocument = gql`
  query QuestionnairePrioritizationRoundStatsByRoundId($roundId: UUID!) {
    questionnairePrioritizationRoundStatsByRoundId(roundId: $roundId) {
      ...PrioritizationContentRoundStats
    }
  }
  ${PrioritizationContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnairePrioritizationRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnairePrioritizationRoundStatsByRoundIdQuery,
  QuestionnairePrioritizationRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnairePrioritizationRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireScaleRoundStatsByRoundIdDocument = gql`
  query QuestionnaireScaleRoundStatsByRoundId($roundId: UUID!) {
    questionnaireScaleRoundStatsByRoundId(roundId: $roundId) {
      ...ScaleContentRoundStats
    }
  }
  ${ScaleContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireScaleRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireScaleRoundStatsByRoundIdQuery,
  QuestionnaireScaleRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireScaleRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireShortAnswerRoundStatsByRoundIdDocument = gql`
  query QuestionnaireShortAnswerRoundStatsByRoundId($roundId: UUID!) {
    questionnaireShortAnswerRoundStatsByRoundId(roundId: $roundId) {
      ...ShortAnswerContentRoundStats
    }
  }
  ${ShortAnswerContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireShortAnswerRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireShortAnswerRoundStatsByRoundIdQuery,
  QuestionnaireShortAnswerRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireShortAnswerRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireSortRoundStatsByRoundIdDocument = gql`
  query QuestionnaireSortRoundStatsByRoundId($roundId: UUID!) {
    questionnaireSortRoundStatsByRoundId(roundId: $roundId) {
      ...SortContentRoundStats
    }
  }
  ${SortContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireSortRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireSortRoundStatsByRoundIdQuery,
  QuestionnaireSortRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireSortRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireWordcloudRoundStatsByRoundIdDocument = gql`
  query QuestionnaireWordcloudRoundStatsByRoundId($roundId: UUID!) {
    questionnaireWordcloudRoundStatsByRoundId(roundId: $roundId) {
      ...WordcloudContentRoundStats
    }
  }
  ${WordcloudContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireWordcloudRoundStatsByRoundIdGql extends Apollo.Query<
  QuestionnaireWordcloudRoundStatsByRoundIdQuery,
  QuestionnaireWordcloudRoundStatsByRoundIdQueryVariables
> {
  document = QuestionnaireWordcloudRoundStatsByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireTextAnswersByRoundIdDocument = gql`
  query QuestionnaireTextAnswersByRoundId($roundId: UUID!) {
    questionnaireTextAnswersByRoundId(roundId: $roundId) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireTextAnswersByRoundIdGql extends Apollo.Query<
  QuestionnaireTextAnswersByRoundIdQuery,
  QuestionnaireTextAnswersByRoundIdQueryVariables
> {
  document = QuestionnaireTextAnswersByRoundIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireBinaryAnswerDocument = gql`
  mutation CreateQuestionnaireBinaryAnswer($roundId: UUID!, $answer: Boolean!) {
    createQuestionnaireBinaryAnswer(
      input: { roundId: $roundId, answer: $answer }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireBinaryAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireBinaryAnswerMutation,
  CreateQuestionnaireBinaryAnswerMutationVariables
> {
  document = CreateQuestionnaireBinaryAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireChoiceAnswerDocument = gql`
  mutation CreateQuestionnaireChoiceAnswer($input: CreateChoiceAnswerInput!) {
    createQuestionnaireChoiceAnswer(input: $input) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireChoiceAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireChoiceAnswerMutation,
  CreateQuestionnaireChoiceAnswerMutationVariables
> {
  document = CreateQuestionnaireChoiceAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireNumericAnswerDocument = gql`
  mutation CreateQuestionnaireNumericAnswer(
    $roundId: UUID!
    $selectedNumber: Float!
  ) {
    createQuestionnaireNumericAnswer(
      input: { roundId: $roundId, selectedNumber: $selectedNumber }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireNumericAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireNumericAnswerMutation,
  CreateQuestionnaireNumericAnswerMutationVariables
> {
  document = CreateQuestionnaireNumericAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnairePrioritizationAnswerDocument = gql`
  mutation CreateQuestionnairePrioritizationAnswer(
    $roundId: UUID!
    $assignedPoints: [Int!]!
  ) {
    createQuestionnairePrioritizationAnswer(
      input: { roundId: $roundId, assignedPoints: $assignedPoints }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnairePrioritizationAnswerGql extends Apollo.Mutation<
  CreateQuestionnairePrioritizationAnswerMutation,
  CreateQuestionnairePrioritizationAnswerMutationVariables
> {
  document = CreateQuestionnairePrioritizationAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireScaleAnswerDocument = gql`
  mutation CreateQuestionnaireScaleAnswer($roundId: UUID!, $rating: Int!) {
    createQuestionnaireScaleAnswer(
      input: { roundId: $roundId, rating: $rating }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireScaleAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireScaleAnswerMutation,
  CreateQuestionnaireScaleAnswerMutationVariables
> {
  document = CreateQuestionnaireScaleAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireShortAnswerAnswerDocument = gql`
  mutation CreateQuestionnaireShortAnswerAnswer(
    $roundId: UUID!
    $body: String!
  ) {
    createQuestionnaireShortAnswerAnswer(
      input: { roundId: $roundId, body: $body }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireShortAnswerAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireShortAnswerAnswerMutation,
  CreateQuestionnaireShortAnswerAnswerMutationVariables
> {
  document = CreateQuestionnaireShortAnswerAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireSortAnswerDocument = gql`
  mutation CreateQuestionnaireSortAnswer(
    $roundId: UUID!
    $selectedChoiceIndexes: [Int!]!
  ) {
    createQuestionnaireSortAnswer(
      input: {
        roundId: $roundId
        selectedChoiceIndexes: $selectedChoiceIndexes
      }
    ) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireSortAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireSortAnswerMutation,
  CreateQuestionnaireSortAnswerMutationVariables
> {
  document = CreateQuestionnaireSortAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireWordcloudAnswerDocument = gql`
  mutation CreateQuestionnaireWordcloudAnswer(
    $input: CreateWordcloudAnswerInput!
  ) {
    createQuestionnaireWordcloudAnswer(input: $input) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireWordcloudAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireWordcloudAnswerMutation,
  CreateQuestionnaireWordcloudAnswerMutationVariables
> {
  document = CreateQuestionnaireWordcloudAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireTextAnswerDocument = gql`
  mutation CreateQuestionnaireTextAnswer($roundId: UUID!, $body: String!) {
    createQuestionnaireTextAnswer(input: { roundId: $roundId, body: $body }) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireTextAnswerGql extends Apollo.Mutation<
  CreateQuestionnaireTextAnswerMutation,
  CreateQuestionnaireTextAnswerMutationVariables
> {
  document = CreateQuestionnaireTextAnswerDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateQuestionnaireAbstentionDocument = gql`
  mutation CreateQuestionnaireAbstention($roundId: UUID!) {
    createQuestionnaireAbstention(roundId: $roundId) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreateQuestionnaireAbstentionGql extends Apollo.Mutation<
  CreateQuestionnaireAbstentionMutation,
  CreateQuestionnaireAbstentionMutationVariables
> {
  document = CreateQuestionnaireAbstentionDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQuestionnaireContentDocument = gql`
  mutation DeleteQuestionnaireContent($id: ID!) {
    deleteQuestionnaireContent(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQuestionnaireContentGql extends Apollo.Mutation<
  DeleteQuestionnaireContentMutation,
  DeleteQuestionnaireContentMutationVariables
> {
  document = DeleteQuestionnaireContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQuestionnaireDocument = gql`
  mutation DeleteQuestionnaire($id: ID!) {
    deleteQuestionnaire(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQuestionnaireGql extends Apollo.Mutation<
  DeleteQuestionnaireMutation,
  DeleteQuestionnaireMutationVariables
> {
  document = DeleteQuestionnaireDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteQuestionnaireAnswersByContentIdDocument = gql`
  mutation DeleteQuestionnaireAnswersByContentId($contentId: UUID!) {
    deleteQuestionnaireAnswersByContentId(contentId: $contentId)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteQuestionnaireAnswersByContentIdGql extends Apollo.Mutation<
  DeleteQuestionnaireAnswersByContentIdMutation,
  DeleteQuestionnaireAnswersByContentIdMutationVariables
> {
  document = DeleteQuestionnaireAnswersByContentIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const BanQuestionnaireShortAnswerContentKeywordDocument = gql`
  mutation BanQuestionnaireShortAnswerContentKeyword(
    $contentId: UUID!
    $keyword: String!
  ) {
    banQuestionnaireShortAnswerContentKeyword(
      contentId: $contentId
      keyword: $keyword
    ) {
      ...ContentDetails
    }
  }
  ${ContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class BanQuestionnaireShortAnswerContentKeywordGql extends Apollo.Mutation<
  BanQuestionnaireShortAnswerContentKeywordMutation,
  BanQuestionnaireShortAnswerContentKeywordMutationVariables
> {
  document = BanQuestionnaireShortAnswerContentKeywordDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const BanQuestionnaireWordcloudContentKeywordDocument = gql`
  mutation BanQuestionnaireWordcloudContentKeyword(
    $contentId: UUID!
    $keyword: String!
  ) {
    banQuestionnaireWordcloudContentKeyword(
      contentId: $contentId
      keyword: $keyword
    ) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class BanQuestionnaireWordcloudContentKeywordGql extends Apollo.Mutation<
  BanQuestionnaireWordcloudContentKeywordMutation,
  BanQuestionnaireWordcloudContentKeywordMutationVariables
> {
  document = BanQuestionnaireWordcloudContentKeywordDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ResetBannedQuestionnaireShortAnswerContentKeywordsDocument = gql`
  mutation ResetBannedQuestionnaireShortAnswerContentKeywords(
    $contentId: UUID!
  ) {
    resetBannedQuestionnaireShortAnswerContentKeywords(contentId: $contentId) {
      ...ContentDetails
    }
  }
  ${ContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class ResetBannedQuestionnaireShortAnswerContentKeywordsGql extends Apollo.Mutation<
  ResetBannedQuestionnaireShortAnswerContentKeywordsMutation,
  ResetBannedQuestionnaireShortAnswerContentKeywordsMutationVariables
> {
  document = ResetBannedQuestionnaireShortAnswerContentKeywordsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ResetBannedQuestionnaireWordcloudContentKeywordsDocument = gql`
  mutation ResetBannedQuestionnaireWordcloudContentKeywords($contentId: UUID!) {
    resetBannedQuestionnaireWordcloudContentKeywords(contentId: $contentId) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class ResetBannedQuestionnaireWordcloudContentKeywordsGql extends Apollo.Mutation<
  ResetBannedQuestionnaireWordcloudContentKeywordsMutation,
  ResetBannedQuestionnaireWordcloudContentKeywordsMutationVariables
> {
  document = ResetBannedQuestionnaireWordcloudContentKeywordsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ToggleQuestionnaireTextContentAnswersPublishedDocument = gql`
  mutation ToggleQuestionnaireTextContentAnswersPublished(
    $contentId: UUID!
    $published: Boolean!
  ) {
    toggleQuestionnaireTextContentAnswersPublished(
      contentId: $contentId
      published: $published
    ) {
      ...ContentDetails
    }
  }
  ${ContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class ToggleQuestionnaireTextContentAnswersPublishedGql extends Apollo.Mutation<
  ToggleQuestionnaireTextContentAnswersPublishedMutation,
  ToggleQuestionnaireTextContentAnswersPublishedMutationVariables
> {
  document = ToggleQuestionnaireTextContentAnswersPublishedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ToggleQuestionnaireTextAnswerHiddenDocument = gql`
  mutation ToggleQuestionnaireTextAnswerHidden(
    $answerId: UUID!
    $hidden: Boolean!
  ) {
    toggleQuestionnaireTextAnswerHidden(answerId: $answerId, hidden: $hidden) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class ToggleQuestionnaireTextAnswerHiddenGql extends Apollo.Mutation<
  ToggleQuestionnaireTextAnswerHiddenMutation,
  ToggleQuestionnaireTextAnswerHiddenMutationVariables
> {
  document = ToggleQuestionnaireTextAnswerHiddenDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ResetQuestionnaireResultsDocument = gql`
  mutation ResetQuestionnaireResults($id: UUID!) {
    resetQuestionnaireResults(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ResetQuestionnaireResultsGql extends Apollo.Mutation<
  ResetQuestionnaireResultsMutation,
  ResetQuestionnaireResultsMutationVariables
> {
  document = ResetQuestionnaireResultsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireDocument = gql`
  mutation UpdateQuestionnaire(
    $id: UUID!
    $name: String
    $published: Boolean
    $publishingMode: QuestionnairePublishingMode
    $statisticsPublished: Boolean
    $correctOptionsPublished: Boolean
    $leaderboardEnabled: Boolean
  ) {
    updateQuestionnaire(
      input: {
        id: $id
        name: $name
        published: $published
        publishingMode: $publishingMode
        statisticsPublished: $statisticsPublished
        correctOptionsPublished: $correctOptionsPublished
        leaderboardEnabled: $leaderboardEnabled
      }
    ) {
      ...QuestionnaireDetails
    }
  }
  ${QuestionnaireDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireGql extends Apollo.Mutation<
  UpdateQuestionnaireMutation,
  UpdateQuestionnaireMutationVariables
> {
  document = UpdateQuestionnaireDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DuplicateQuestionnaireContentDocument = gql`
  mutation DuplicateQuestionnaireContent($id: ID!) {
    duplicateQuestionnaireContent(id: $id) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class DuplicateQuestionnaireContentGql extends Apollo.Mutation<
  DuplicateQuestionnaireContentMutation,
  DuplicateQuestionnaireContentMutationVariables
> {
  document = DuplicateQuestionnaireContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CopyQuestionnaireContentToQuestionnaireDocument = gql`
  mutation CopyQuestionnaireContentToQuestionnaire(
    $contentId: UUID!
    $questionnaireId: UUID!
  ) {
    copyQuestionnaireContentToQuestionnaire(
      contentId: $contentId
      questionnaireId: $questionnaireId
    ) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CopyQuestionnaireContentToQuestionnaireGql extends Apollo.Mutation<
  CopyQuestionnaireContentToQuestionnaireMutation,
  CopyQuestionnaireContentToQuestionnaireMutationVariables
> {
  document = CopyQuestionnaireContentToQuestionnaireDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const MoveQuestionnaireContentToQuestionnaireDocument = gql`
  mutation MoveQuestionnaireContentToQuestionnaire(
    $contentId: UUID!
    $questionnaireId: UUID!
  ) {
    moveQuestionnaireContentToQuestionnaire(
      contentId: $contentId
      questionnaireId: $questionnaireId
    ) {
      ...CreatorContentDetails
    }
  }
  ${CreatorContentDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class MoveQuestionnaireContentToQuestionnaireGql extends Apollo.Mutation<
  MoveQuestionnaireContentToQuestionnaireMutation,
  MoveQuestionnaireContentToQuestionnaireMutationVariables
> {
  document = MoveQuestionnaireContentToQuestionnaireDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateQuestionnaireContentOrderDocument = gql`
  mutation UpdateQuestionnaireContentOrder(
    $questionnaireId: UUID!
    $contentIds: [UUID!]!
  ) {
    updateQuestionnaireContentOrder(
      questionnaireId: $questionnaireId
      contentIds: $contentIds
    ) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateQuestionnaireContentOrderGql extends Apollo.Mutation<
  UpdateQuestionnaireContentOrderMutation,
  UpdateQuestionnaireContentOrderMutationVariables
> {
  document = UpdateQuestionnaireContentOrderDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireUpdatedDocument = gql`
  subscription QuestionnaireUpdated($questionnaireId: UUID!) {
    questionnaireUpdated(questionnaireId: $questionnaireId) {
      id
      publishingMode
      publishedUpToContent {
        id
        position
      }
      activeRound {
        ...Round
      }
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireUpdatedGql extends Apollo.Subscription<
  QuestionnaireUpdatedSubscription,
  QuestionnaireUpdatedSubscriptionVariables
> {
  document = QuestionnaireUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireContentUpdatedDocument = gql`
  subscription QuestionnaireContentUpdated($questionnaireId: UUID!) {
    questionnaireContentUpdated(questionnaireId: $questionnaireId) {
      id
      answerCount
      abstentionCount
      activeRound {
        ...Round
      }
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireContentUpdatedGql extends Apollo.Subscription<
  QuestionnaireContentUpdatedSubscription,
  QuestionnaireContentUpdatedSubscriptionVariables
> {
  document = QuestionnaireContentUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreatorQuestionnaireContentUpdatedDocument = gql`
  subscription CreatorQuestionnaireContentUpdated($questionnaireId: UUID!) {
    questionnaireContentUpdated(questionnaireId: $questionnaireId) {
      id
      answerCount
      abstentionCount
      correctAnswerCount
      hasAnswers
      activeRound {
        ...Round
      }
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class CreatorQuestionnaireContentUpdatedGql extends Apollo.Subscription<
  CreatorQuestionnaireContentUpdatedSubscription,
  CreatorQuestionnaireContentUpdatedSubscriptionVariables
> {
  document = CreatorQuestionnaireContentUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireBinaryRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireBinaryRoundStatsUpdated($roundId: UUID!) {
    questionnaireBinaryRoundStatsUpdated(roundId: $roundId) {
      ...BinaryContentRoundStats
    }
  }
  ${BinaryContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireBinaryRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireBinaryRoundStatsUpdatedSubscription,
  QuestionnaireBinaryRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireBinaryRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireChoiceRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireChoiceRoundStatsUpdated($roundId: UUID!) {
    questionnaireChoiceRoundStatsUpdated(roundId: $roundId) {
      selectionCounts
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireChoiceRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireChoiceRoundStatsUpdatedSubscription,
  QuestionnaireChoiceRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireChoiceRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireNumericRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireNumericRoundStatsUpdated($roundId: UUID!) {
    questionnaireNumericRoundStatsUpdated(roundId: $roundId) {
      ...NumericContentRoundStats
    }
  }
  ${NumericContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireNumericRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireNumericRoundStatsUpdatedSubscription,
  QuestionnaireNumericRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireNumericRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnairePrioritizationRoundStatsUpdatedDocument = gql`
  subscription QuestionnairePrioritizationRoundStatsUpdated($roundId: UUID!) {
    questionnairePrioritizationRoundStatsUpdated(roundId: $roundId) {
      ...PrioritizationContentRoundStats
    }
  }
  ${PrioritizationContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnairePrioritizationRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnairePrioritizationRoundStatsUpdatedSubscription,
  QuestionnairePrioritizationRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnairePrioritizationRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireScaleRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireScaleRoundStatsUpdated($roundId: UUID!) {
    questionnaireScaleRoundStatsUpdated(roundId: $roundId) {
      ...ScaleContentRoundStats
    }
  }
  ${ScaleContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireScaleRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireScaleRoundStatsUpdatedSubscription,
  QuestionnaireScaleRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireScaleRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireShortAnswerRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireShortAnswerRoundStatsUpdated($roundId: UUID!) {
    questionnaireShortAnswerRoundStatsUpdated(roundId: $roundId) {
      ...ShortAnswerContentRoundStats
    }
  }
  ${ShortAnswerContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireShortAnswerRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireShortAnswerRoundStatsUpdatedSubscription,
  QuestionnaireShortAnswerRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireShortAnswerRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireSortRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireSortRoundStatsUpdated($roundId: UUID!) {
    questionnaireSortRoundStatsUpdated(roundId: $roundId) {
      ...SortContentRoundStats
    }
  }
  ${SortContentRoundStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireSortRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireSortRoundStatsUpdatedSubscription,
  QuestionnaireSortRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireSortRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireWordcloudRoundStatsUpdatedDocument = gql`
  subscription QuestionnaireWordcloudRoundStatsUpdated($roundId: UUID!) {
    questionnaireWordcloudRoundStatsUpdated(roundId: $roundId) {
      words
      counts
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireWordcloudRoundStatsUpdatedGql extends Apollo.Subscription<
  QuestionnaireWordcloudRoundStatsUpdatedSubscription,
  QuestionnaireWordcloudRoundStatsUpdatedSubscriptionVariables
> {
  document = QuestionnaireWordcloudRoundStatsUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireTextAnswersUpdatedDocument = gql`
  subscription QuestionnaireTextAnswersUpdated($roundId: UUID!) {
    questionnaireTextAnswersUpdated(roundId: $roundId) {
      ...Answer
    }
  }
  ${AnswerFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireTextAnswersUpdatedGql extends Apollo.Subscription<
  QuestionnaireTextAnswersUpdatedSubscription,
  QuestionnaireTextAnswersUpdatedSubscriptionVariables
> {
  document = QuestionnaireTextAnswersUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireLeaderboardUpdatedDocument = gql`
  subscription QuestionnaireLeaderboardUpdated(
    $questionnaireId: UUID!
    $contentId: UUID
    $limit: Int
  ) {
    questionnaireLeaderboardUpdated(
      questionnaireId: $questionnaireId
      contentId: $contentId
      limit: $limit
    ) {
      ...LeaderboardPage
    }
  }
  ${LeaderboardPageFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireLeaderboardUpdatedGql extends Apollo.Subscription<
  QuestionnaireLeaderboardUpdatedSubscription,
  QuestionnaireLeaderboardUpdatedSubscriptionVariables
> {
  document = QuestionnaireLeaderboardUpdatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const StartQuestionnaireContentDocument = gql`
  mutation StartQuestionnaireContent($contentId: UUID!) {
    startQuestionnaireContent(contentId: $contentId) {
      id
      activeRound {
        ...Round
      }
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class StartQuestionnaireContentGql extends Apollo.Mutation<
  StartQuestionnaireContentMutation,
  StartQuestionnaireContentMutationVariables
> {
  document = StartQuestionnaireContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const StartQuestionnaireContentRoundDocument = gql`
  mutation StartQuestionnaireContentRound($contentId: UUID!) {
    startQuestionnaireContentRound(contentId: $contentId) {
      ...Round
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class StartQuestionnaireContentRoundGql extends Apollo.Mutation<
  StartQuestionnaireContentRoundMutation,
  StartQuestionnaireContentRoundMutationVariables
> {
  document = StartQuestionnaireContentRoundDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const StopQuestionnaireContentDocument = gql`
  mutation StopQuestionnaireContent($questionnaireId: UUID!) {
    stopQuestionnaireContent(questionnaireId: $questionnaireId) {
      id
      activeRound {
        ...Round
      }
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class StopQuestionnaireContentGql extends Apollo.Mutation<
  StopQuestionnaireContentMutation,
  StopQuestionnaireContentMutationVariables
> {
  document = StopQuestionnaireContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const QuestionnaireRoundsByContentIdDocument = gql`
  query QuestionnaireRoundsByContentId($contentId: UUID!) {
    questionnaireRoundsByContentId(contentId: $contentId) {
      ...Round
    }
  }
  ${RoundFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireRoundsByContentIdGql extends Apollo.Query<
  QuestionnaireRoundsByContentIdQuery,
  QuestionnaireRoundsByContentIdQueryVariables
> {
  document = QuestionnaireRoundsByContentIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const PublishQuestionnaireUpToContentDocument = gql`
  mutation PublishQuestionnaireUpToContent(
    $questionnaireId: UUID!
    $contentId: UUID!
  ) {
    publishQuestionnaireUpToContent(
      questionnaireId: $questionnaireId
      contentId: $contentId
    ) {
      id
      publishedUpToContent {
        id
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class PublishQuestionnaireUpToContentGql extends Apollo.Mutation<
  PublishQuestionnaireUpToContentMutation,
  PublishQuestionnaireUpToContentMutationVariables
> {
  document = PublishQuestionnaireUpToContentDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomIdByShortIdDocument = gql`
  query RoomIdByShortId($shortId: String!) {
    roomByShortId(shortId: $shortId) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RoomIdByShortIdGql extends Apollo.Query<
  RoomIdByShortIdQuery,
  RoomIdByShortIdQueryVariables
> {
  document = RoomIdByShortIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomLanguageByShortIdDocument = gql`
  query RoomLanguageByShortId($shortId: String!) {
    roomByShortId(shortId: $shortId) {
      language
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RoomLanguageByShortIdGql extends Apollo.Query<
  RoomLanguageByShortIdQuery,
  RoomLanguageByShortIdQueryVariables
> {
  document = RoomLanguageByShortIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomByIdDocument = gql`
  query RoomById($id: ID!) {
    roomById(id: $id) {
      ...RoomDetailsFragment
    }
  }
  ${RoomDetailsFragmentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomByIdGql extends Apollo.Query<
  RoomByIdQuery,
  RoomByIdQueryVariables
> {
  document = RoomByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomFocusModeEnabledByIdDocument = gql`
  query RoomFocusModeEnabledById($id: ID!) {
    roomById(id: $id) {
      focusModeEnabled
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RoomFocusModeEnabledByIdGql extends Apollo.Query<
  RoomFocusModeEnabledByIdQuery,
  RoomFocusModeEnabledByIdQueryVariables
> {
  document = RoomFocusModeEnabledByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomByShortIdDocument = gql`
  query RoomByShortId($shortId: String!) {
    roomByShortId(shortId: $shortId) {
      ...RoomDetailsFragment
    }
  }
  ${RoomDetailsFragmentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomByShortIdGql extends Apollo.Query<
  RoomByShortIdQuery,
  RoomByShortIdQueryVariables
> {
  document = RoomByShortIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomsDocument = gql`
  query Rooms($room: RoomQueryInput!, $cursor: String) {
    rooms(room: $room, first: 10, after: $cursor) {
      edges {
        node {
          ...RoomDetailsFragment
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${RoomDetailsFragmentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomsGql extends Apollo.Query<RoomsQuery, RoomsQueryVariables> {
  document = RoomsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomMembershipByIdDocument = gql`
  query RoomMembershipById($roomId: UUID!) {
    roomMembershipById(roomId: $roomId) {
      ...RoomMembership
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomMembershipByIdGql extends Apollo.Query<
  RoomMembershipByIdQuery,
  RoomMembershipByIdQueryVariables
> {
  document = RoomMembershipByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomMembershipByShortIdDocument = gql`
  query RoomMembershipByShortId($shortId: String!) {
    roomMembershipByShortId(shortId: $shortId) {
      ...RoomMembership
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomMembershipByShortIdGql extends Apollo.Query<
  RoomMembershipByShortIdQuery,
  RoomMembershipByShortIdQueryVariables
> {
  document = RoomMembershipByShortIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomMembershipsDocument = gql`
  query RoomMemberships($query: RoomQueryInput, $cursor: String) {
    roomMemberships(query: $query, first: 10, after: $cursor) {
      edges {
        node {
          ...RoomMembership
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomMembershipsGql extends Apollo.Query<
  RoomMembershipsQuery,
  RoomMembershipsQueryVariables
> {
  document = RoomMembershipsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomsByUserIdDocument = gql`
  query RoomsByUserId($userId: UUID!, $cursor: String) {
    roomsByUserId(userId: $userId, first: 10, after: $cursor) {
      edges {
        node {
          ...RoomMembership
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomsByUserIdGql extends Apollo.Query<
  RoomsByUserIdQuery,
  RoomsByUserIdQueryVariables
> {
  document = RoomsByUserIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomStatsByIdDocument = gql`
  query RoomStatsById($id: ID!) {
    roomById(id: $id) {
      stats {
        ...RoomStats
      }
    }
  }
  ${RoomStatsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomStatsByIdGql extends Apollo.Query<
  RoomStatsByIdQuery,
  RoomStatsByIdQueryVariables
> {
  document = RoomStatsByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const JoinRoomDocument = gql`
  mutation JoinRoom($shortId: ID!) {
    joinRoom(input: { shortId: $shortId }) {
      ...RoomMembership
    }
  }
  ${RoomMembershipFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class JoinRoomGql extends Apollo.Mutation<
  JoinRoomMutation,
  JoinRoomMutationVariables
> {
  document = JoinRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CreateRoomDocument = gql`
  mutation CreateRoom($name: String!) {
    createRoom(input: { name: $name }) {
      id
      shortId
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CreateRoomGql extends Apollo.Mutation<
  CreateRoomMutation,
  CreateRoomMutationVariables
> {
  document = CreateRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteRoomDocument = gql`
  mutation DeleteRoom($id: ID!) {
    deleteRoom(id: $id)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteRoomGql extends Apollo.Mutation<
  DeleteRoomMutation,
  DeleteRoomMutationVariables
> {
  document = DeleteRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DuplicateRoomDocument = gql`
  mutation DuplicateRoom($id: ID!, $newName: String!) {
    duplicateRoom(input: { id: $id, newName: $newName }) {
      id
      shortId
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DuplicateRoomGql extends Apollo.Mutation<
  DuplicateRoomMutation,
  DuplicateRoomMutationVariables
> {
  document = DuplicateRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DuplicateDemoRoomDocument = gql`
  mutation DuplicateDemoRoom {
    duplicateDemoRoom {
      id
      shortId
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DuplicateDemoRoomGql extends Apollo.Mutation<
  DuplicateDemoRoomMutation,
  DuplicateDemoRoomMutationVariables
> {
  document = DuplicateDemoRoomDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateRoomDetailsDocument = gql`
  mutation UpdateRoomDetails(
    $id: ID!
    $name: String!
    $description: String!
    $languageCode: String
  ) {
    updateRoomName(id: $id, name: $name) {
      id
      name
    }
    updateRoomDescription(id: $id, description: $description) {
      id
      description
      descriptionRendered
    }
    updateRoomLanguage(id: $id, languageCode: $languageCode) {
      id
      language
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateRoomDetailsGql extends Apollo.Mutation<
  UpdateRoomDetailsMutation,
  UpdateRoomDetailsMutationVariables
> {
  document = UpdateRoomDetailsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateRoomLanguageDocument = gql`
  mutation UpdateRoomLanguage($id: ID!, $languageCode: String!) {
    updateRoomLanguage(id: $id, languageCode: $languageCode) {
      id
      language
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateRoomLanguageGql extends Apollo.Mutation<
  UpdateRoomLanguageMutation,
  UpdateRoomLanguageMutationVariables
> {
  document = UpdateRoomLanguageDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateRoomFocusModeDocument = gql`
  mutation UpdateRoomFocusMode($id: ID!, $enabled: Boolean!) {
    updateRoomFocusMode(id: $id, enabled: $enabled) {
      id
      focusModeEnabled
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateRoomFocusModeGql extends Apollo.Mutation<
  UpdateRoomFocusModeMutation,
  UpdateRoomFocusModeMutationVariables
> {
  document = UpdateRoomFocusModeDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomManagingMembersByRoomIdDocument = gql`
  query RoomManagingMembersByRoomId($roomId: UUID!) {
    roomManagingMembersByRoomId(roomId: $roomId) {
      ...RoomMember
    }
  }
  ${RoomMemberFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomManagingMembersByRoomIdGql extends Apollo.Query<
  RoomManagingMembersByRoomIdQuery,
  RoomManagingMembersByRoomIdQueryVariables
> {
  document = RoomManagingMembersByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GrantRoomRoleDocument = gql`
  mutation GrantRoomRole($roomId: UUID!, $userId: UUID!, $role: RoomRole!) {
    grantRoomRole(roomId: $roomId, userId: $userId, role: $role) {
      room {
        id
      }
      user {
        id
      }
      role
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GrantRoomRoleGql extends Apollo.Mutation<
  GrantRoomRoleMutation,
  GrantRoomRoleMutationVariables
> {
  document = GrantRoomRoleDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GrantRoomRoleByInvitationDocument = gql`
  mutation GrantRoomRoleByInvitation(
    $roomId: UUID!
    $mailAddress: String!
    $role: RoomRole!
  ) {
    grantRoomRoleByInvitation(
      roomId: $roomId
      mailAddress: $mailAddress
      role: $role
    ) {
      room {
        id
      }
      user {
        id
      }
      role
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GrantRoomRoleByInvitationGql extends Apollo.Mutation<
  GrantRoomRoleByInvitationMutation,
  GrantRoomRoleByInvitationMutationVariables
> {
  document = GrantRoomRoleByInvitationDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RevokeRoomRoleDocument = gql`
  mutation RevokeRoomRole($roomId: UUID!, $userId: UUID!) {
    revokeRoomRole(roomId: $roomId, userId: $userId) {
      room {
        id
      }
      user {
        id
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RevokeRoomRoleGql extends Apollo.Mutation<
  RevokeRoomRoleMutation,
  RevokeRoomRoleMutationVariables
> {
  document = RevokeRoomRoleDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RevokeRoomMembershipDocument = gql`
  mutation RevokeRoomMembership($roomId: UUID!) {
    revokeRoomMembership(roomId: $roomId) {
      room {
        id
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RevokeRoomMembershipGql extends Apollo.Mutation<
  RevokeRoomMembershipMutation,
  RevokeRoomMembershipMutationVariables
> {
  document = RevokeRoomMembershipDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RoomUserAliasByRoomIdDocument = gql`
  query RoomUserAliasByRoomId($roomId: UUID!) {
    roomUserAliasByRoomId(roomId: $roomId) {
      ...RoomUserAlias
    }
  }
  ${RoomUserAliasFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class RoomUserAliasByRoomIdGql extends Apollo.Query<
  RoomUserAliasByRoomIdQuery,
  RoomUserAliasByRoomIdQueryVariables
> {
  document = RoomUserAliasByRoomIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const SetRoomUserAliasDocument = gql`
  mutation SetRoomUserAlias($roomId: UUID!, $alias: String, $seed: Int) {
    setRoomUserAlias(input: { roomId: $roomId, alias: $alias, seed: $seed }) {
      ...RoomUserAlias
    }
  }
  ${RoomUserAliasFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class SetRoomUserAliasGql extends Apollo.Mutation<
  SetRoomUserAliasMutation,
  SetRoomUserAliasMutationVariables
> {
  document = SetRoomUserAliasDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CurrentUserDocument = gql`
  query CurrentUser {
    currentUser {
      id
      verified
      displayId
      displayName
      unverifiedMailAddress
      language
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CurrentUserGql extends Apollo.Query<
  CurrentUserQuery,
  CurrentUserQueryVariables
> {
  document = CurrentUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UserByDisplayIdDocument = gql`
  query UserByDisplayId($displayId: ID!) {
    userByDisplayId(displayId: $displayId) {
      id
      verified
      displayId
      displayName
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UserByDisplayIdGql extends Apollo.Query<
  UserByDisplayIdQuery,
  UserByDisplayIdQueryVariables
> {
  document = UserByDisplayIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CurrentUserWithSettingsDocument = gql`
  query CurrentUserWithSettings {
    currentUser {
      id
      verified
      displayId
      displayName
      mailAddress
      unverifiedMailAddress
      localPasswordSet
      uiSettings {
        contentAnswersDirectlyBelowChart
        contentVisualizationUnitPercent
        showContentResultsDirectly
        rotateWordcloudItems
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CurrentUserWithSettingsGql extends Apollo.Query<
  CurrentUserWithSettingsQuery,
  CurrentUserWithSettingsQueryVariables
> {
  document = CurrentUserWithSettingsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ClaimUnverifiedUserDocument = gql`
  mutation ClaimUnverifiedUser($mailAddress: String!, $password: String!) {
    claimUnverifiedUser(mailAddress: $mailAddress, password: $password) {
      id
      displayId
      unverifiedMailAddress
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ClaimUnverifiedUserGql extends Apollo.Mutation<
  ClaimUnverifiedUserMutation,
  ClaimUnverifiedUserMutationVariables
> {
  document = ClaimUnverifiedUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const VerifyUserMailAddressDocument = gql`
  mutation VerifyUserMailAddress($verificationCode: String!) {
    verifyUserMailAddress(verificationCode: $verificationCode) {
      id
      displayId
      unverifiedMailAddress
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class VerifyUserMailAddressGql extends Apollo.Mutation<
  VerifyUserMailAddressMutation,
  VerifyUserMailAddressMutationVariables
> {
  document = VerifyUserMailAddressDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const VerifyUserMailAddressUnauthenticatedDocument = gql`
  mutation VerifyUserMailAddressUnauthenticated(
    $verificationCode: String!
    $userId: UUID!
    $password: String
  ) {
    verifyUserMailAddressUnauthenticated(
      verificationCode: $verificationCode
      userId: $userId
      password: $password
    ) {
      id
      displayId
      unverifiedMailAddress
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class VerifyUserMailAddressUnauthenticatedGql extends Apollo.Mutation<
  VerifyUserMailAddressUnauthenticatedMutation,
  VerifyUserMailAddressUnauthenticatedMutationVariables
> {
  document = VerifyUserMailAddressUnauthenticatedDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const DeleteUserDocument = gql`
  mutation DeleteUser {
    deleteUser
  }
`;

@Injectable({
  providedIn: 'root',
})
export class DeleteUserGql extends Apollo.Mutation<
  DeleteUserMutation,
  DeleteUserMutationVariables
> {
  document = DeleteUserDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateUserSettingsDocument = gql`
  mutation UpdateUserSettings(
    $contentAnswersDirectlyBelowChart: Boolean
    $contentVisualizationUnitPercent: Boolean
    $showContentResultsDirectly: Boolean
    $rotateWordcloudItems: Boolean
  ) {
    updateUserUiSettings(
      input: {
        contentAnswersDirectlyBelowChart: $contentAnswersDirectlyBelowChart
        contentVisualizationUnitPercent: $contentVisualizationUnitPercent
        showContentResultsDirectly: $showContentResultsDirectly
        rotateWordcloudItems: $rotateWordcloudItems
      }
    ) {
      contentAnswersDirectlyBelowChart
      contentVisualizationUnitPercent
      showContentResultsDirectly
      rotateWordcloudItems
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateUserSettingsGql extends Apollo.Mutation<
  UpdateUserSettingsMutation,
  UpdateUserSettingsMutationVariables
> {
  document = UpdateUserSettingsDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RequestUserPasswordResetDocument = gql`
  mutation RequestUserPasswordReset($mailAddress: String!) {
    requestUserPasswordReset(mailAddress: $mailAddress)
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RequestUserPasswordResetGql extends Apollo.Mutation<
  RequestUserPasswordResetMutation,
  RequestUserPasswordResetMutationVariables
> {
  document = RequestUserPasswordResetDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RequestUserPasswordSetupDocument = gql`
  mutation RequestUserPasswordSetup {
    requestUserPasswordSetup
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RequestUserPasswordSetupGql extends Apollo.Mutation<
  RequestUserPasswordSetupMutation,
  RequestUserPasswordSetupMutationVariables
> {
  document = RequestUserPasswordSetupDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ResetUserPasswordDocument = gql`
  mutation resetUserPassword(
    $mailAddress: String!
    $password: String!
    $verificationCode: String!
  ) {
    resetUserPassword(
      mailAddress: $mailAddress
      password: $password
      verificationCode: $verificationCode
    ) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ResetUserPasswordGql extends Apollo.Mutation<
  ResetUserPasswordMutation,
  ResetUserPasswordMutationVariables
> {
  document = ResetUserPasswordDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateUserLanguageDocument = gql`
  mutation updateUserLanguage($languageCode: String!) {
    updateUserLanguage(languageCode: $languageCode) {
      id
      language
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateUserLanguageGql extends Apollo.Mutation<
  UpdateUserLanguageMutation,
  UpdateUserLanguageMutationVariables
> {
  document = UpdateUserLanguageDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const ResendVerificationMailDocument = gql`
  mutation ResendVerificationMail {
    resendVerificationMail
  }
`;

@Injectable({
  providedIn: 'root',
})
export class ResendVerificationMailGql extends Apollo.Mutation<
  ResendVerificationMailMutation,
  ResendVerificationMailMutationVariables
> {
  document = ResendVerificationMailDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateUserMailAddressDocument = gql`
  mutation UpdateUserMailAddress($mailAddress: String!, $password: String!) {
    updateUserMailAddress(mailAddress: $mailAddress, password: $password) {
      id
      unverifiedMailAddress
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateUserMailAddressGql extends Apollo.Mutation<
  UpdateUserMailAddressMutation,
  UpdateUserMailAddressMutationVariables
> {
  document = UpdateUserMailAddressDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UpdateUserPasswordDocument = gql`
  mutation UpdateUserPassword($oldPassword: String!, $newPassword: String!) {
    updateUserPassword(oldPassword: $oldPassword, newPassword: $newPassword) {
      id
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class UpdateUserPasswordGql extends Apollo.Mutation<
  UpdateUserPasswordMutation,
  UpdateUserPasswordMutationVariables
> {
  document = UpdateUserPasswordDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
