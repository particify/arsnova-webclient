import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  UUID: { input: string; output: string };
};

export type AdminActiveRoomStats = {
  __typename?: 'AdminActiveRoomStats';
  activityWindowMinutes: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  minMemberCount: Scalars['Int']['output'];
};

export type AdminAnnouncementStats = {
  __typename?: 'AdminAnnouncementStats';
  totalCount: Scalars['Int']['output'];
};

export type AdminQnaStats = {
  __typename?: 'AdminQnaStats';
  postCount: Scalars['Int']['output'];
};

export type AdminRoom = {
  __typename?: 'AdminRoom';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  descriptionRendered?: Maybe<Scalars['String']['output']>;
  focusModeEnabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  shortId: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type AdminRoomActivityStats = {
  __typename?: 'AdminRoomActivityStats';
  managingUserCount: Scalars['Int']['output'];
  participantCount: Scalars['Int']['output'];
  roomCount: Scalars['Int']['output'];
};

export type AdminRoomConnection = {
  __typename?: 'AdminRoomConnection';
  edges?: Maybe<Array<Maybe<AdminRoomEdge>>>;
  pageInfo: PageInfo;
};

export type AdminRoomEdge = {
  __typename?: 'AdminRoomEdge';
  cursor: Scalars['String']['output'];
  node: AdminRoom;
};

export type AdminRoomQueryInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  shortId?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminRoomStats = {
  __typename?: 'AdminRoomStats';
  activeRoomCount: Scalars['Int']['output'];
  managingUserCount: Scalars['Int']['output'];
  membershipCount: Scalars['Int']['output'];
  participantCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  displayId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  mailAddress?: Maybe<Scalars['String']['output']>;
  uiSettings?: Maybe<UserUiSettings>;
  unverifiedMailAddress?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  verificationCode?: Maybe<Scalars['Int']['output']>;
  verificationErrors?: Maybe<Scalars['Int']['output']>;
  verificationExpiresAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AdminUserConnection = {
  __typename?: 'AdminUserConnection';
  edges?: Maybe<Array<Maybe<AdminUserEdge>>>;
  pageInfo: PageInfo;
};

export type AdminUserEdge = {
  __typename?: 'AdminUserEdge';
  cursor: Scalars['String']['output'];
  node: AdminUser;
};

export type AdminUserStats = {
  __typename?: 'AdminUserStats';
  pendingCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  verifiedCount: Scalars['Int']['output'];
};

export type Announcement = {
  __typename?: 'Announcement';
  body: Scalars['String']['output'];
  bodyRendered?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  room?: Maybe<Room>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AnnouncementConnection = {
  __typename?: 'AnnouncementConnection';
  edges?: Maybe<Array<Maybe<AnnouncementEdge>>>;
  pageInfo: PageInfo;
};

export type AnnouncementEdge = {
  __typename?: 'AnnouncementEdge';
  cursor: Scalars['String']['output'];
  node: Announcement;
};

export type AnnouncementsMeta = {
  __typename?: 'AnnouncementsMeta';
  count: Scalars['Int']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Answer = {
  __typename?: 'Answer';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  durationMs?: Maybe<Scalars['Int']['output']>;
  formatData?: Maybe<AnswerFormatData>;
  hidden: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  result: AnswerResultState;
};

export type AnswerFormatData =
  ChoiceAnswerFormatData | WordcloudAnswerFormatData;

export type AnswerOption = {
  __typename?: 'AnswerOption';
  label: Scalars['String']['output'];
  labelRendered?: Maybe<Scalars['String']['output']>;
};

export enum AnswerResultState {
  Abstained = 'ABSTAINED',
  Correct = 'CORRECT',
  Neutral = 'NEUTRAL',
  Unanswered = 'UNANSWERED',
  Wrong = 'WRONG',
}

export type ChoiceAnswerFormatData = {
  __typename?: 'ChoiceAnswerFormatData';
  format: ContentType;
  selectedChoiceIndexes: Array<Scalars['Int']['output']>;
};

export type ChoiceContentFormatData = {
  __typename?: 'ChoiceContentFormatData';
  correctOptionIndexes?: Maybe<Array<Scalars['Int']['output']>>;
  format: ContentType;
  multiple?: Maybe<Scalars['Boolean']['output']>;
  options: Array<AnswerOption>;
};

export type ChoiceContentRoundStats = {
  __typename?: 'ChoiceContentRoundStats';
  selectionCounts?: Maybe<Array<Scalars['Int']['output']>>;
};

export type Content = {
  __typename?: 'Content';
  abstentionCount?: Maybe<Scalars['Int']['output']>;
  abstentionsAllowed?: Maybe<Scalars['Boolean']['output']>;
  activeRound?: Maybe<Round>;
  answerCount?: Maybe<Scalars['Int']['output']>;
  body: Scalars['String']['output'];
  bodyRendered?: Maybe<Scalars['String']['output']>;
  correctAnswerCount?: Maybe<Scalars['Int']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  formatData: ContentFormatData;
  hasAnswers: Scalars['Boolean']['output'];
  hasCorrectAnswer?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  position?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Int']['output']>;
};

export type ContentAnswerResult = {
  __typename?: 'ContentAnswerResult';
  contentId: Scalars['UUID']['output'];
  durationMs?: Maybe<Scalars['Int']['output']>;
  result: AnswerResultState;
};

export type ContentConnection = {
  __typename?: 'ContentConnection';
  edges?: Maybe<Array<Maybe<ContentEdge>>>;
  pageInfo: PageInfo;
};

export type ContentEdge = {
  __typename?: 'ContentEdge';
  cursor: Scalars['String']['output'];
  node: Content;
};

export type ContentFormatData =
  | ChoiceContentFormatData
  | ScaleContentFormatData
  | TextContentFormatData
  | WordcloudContentFormatData;

export enum ContentType {
  Binary = 'BINARY',
  Choice = 'CHOICE',
  Flashcard = 'FLASHCARD',
  Numeric = 'NUMERIC',
  Prioritization = 'PRIORITIZATION',
  Scale = 'SCALE',
  ShortAnswer = 'SHORT_ANSWER',
  Slide = 'SLIDE',
  Sort = 'SORT',
  Text = 'TEXT',
  Wordcloud = 'WORDCLOUD',
}

export type ContentWithAnswer = {
  __typename?: 'ContentWithAnswer';
  abstentionsAllowed?: Maybe<Scalars['Boolean']['output']>;
  answerResult?: Maybe<AnswerResultState>;
  bodyRendered?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  formatData: ContentFormatData;
  id: Scalars['ID']['output'];
};

export enum CorrectState {
  Correct = 'CORRECT',
  Unset = 'UNSET',
  Wrong = 'WRONG',
}

export type CreateAnnouncementInput = {
  body: Scalars['String']['input'];
  roomId: Scalars['UUID']['input'];
  title: Scalars['String']['input'];
};

export type CreateChoiceAnswerInput = {
  roundId: Scalars['UUID']['input'];
  selectedChoiceIndexes: Array<Scalars['Int']['input']>;
};

export type CreateChoiceContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctOptionIndexes?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  multiple?: InputMaybe<Scalars['Boolean']['input']>;
  options: Array<Scalars['String']['input']>;
  questionnaireId: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type CreatePostInput = {
  body: Scalars['String']['input'];
  qnaId: Scalars['UUID']['input'];
  tagIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type CreateQnaInput = {
  roomId: Scalars['UUID']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
};

export type CreateQuestionnaireInput = {
  name: Scalars['String']['input'];
  roomId: Scalars['UUID']['input'];
  type: QuestionnaireType;
};

export type CreateReplyEvent = {
  __typename?: 'CreateReplyEvent';
  postId: Scalars['ID']['output'];
  reply: Reply;
};

export type CreateReplyInput = {
  body: Scalars['String']['input'];
  postId: Scalars['UUID']['input'];
};

export type CreateRoomInput = {
  name: Scalars['String']['input'];
};

export type CreateTagInput = {
  name: Scalars['String']['input'];
  qnaId: Scalars['UUID']['input'];
};

export type CreateWordcloudAnswerInput = {
  roundId: Scalars['UUID']['input'];
  words: Array<Scalars['String']['input']>;
};

export type CreateWordcloudContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  maxAnswers: Scalars['Int']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type DuplicateRoomInput = {
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
};

export type JoinRoomInput =
  | { id: Scalars['ID']['input']; shortId?: never }
  | { id?: never; shortId: Scalars['ID']['input'] };

export enum ModerationState {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export type Mutation = {
  __typename?: 'Mutation';
  acceptQnaPost: Post;
  adminCreateUser: AdminUser;
  adminDeleteRoomById: Scalars['UUID']['output'];
  adminDeleteUserById: Scalars['UUID']['output'];
  adminTransferRoom: AdminRoom;
  adminVerifyUserById: AdminUser;
  banQuestionnaireWordcloudContentKeyword?: Maybe<Content>;
  claimUnverifiedUser?: Maybe<User>;
  copyQuestionnaireContentToQuestionnaire?: Maybe<Content>;
  createAnnouncement: Announcement;
  createQnaPost: Post;
  createQnaReply: Reply;
  createQnaTag: Tag;
  createQuestionnaire: Questionnaire;
  createQuestionnaireAbstention?: Maybe<Answer>;
  createQuestionnaireChoiceAnswer?: Maybe<Answer>;
  createQuestionnaireChoiceContent?: Maybe<Content>;
  createQuestionnaireWordcloudAnswer?: Maybe<Answer>;
  createQuestionnaireWordcloudContent?: Maybe<Content>;
  createRoom: Room;
  deleteAnnouncement: Scalars['ID']['output'];
  deleteQnaPost: Scalars['ID']['output'];
  deleteQnaPostsByQnaId: Scalars['Int']['output'];
  deleteQnaReply: Scalars['ID']['output'];
  deleteQnaTag: Scalars['ID']['output'];
  deleteQuestionnaire?: Maybe<Scalars['ID']['output']>;
  deleteQuestionnaireAnswersByContentId?: Maybe<Scalars['Boolean']['output']>;
  deleteQuestionnaireContent?: Maybe<Scalars['ID']['output']>;
  deleteRoom: Scalars['UUID']['output'];
  deleteUser?: Maybe<Scalars['UUID']['output']>;
  duplicateDemoRoom: Room;
  duplicateQuestionnaire: Questionnaire;
  duplicateQuestionnaireContent?: Maybe<Content>;
  duplicateRoom: Room;
  grantRoomRole: RoomMember;
  grantRoomRoleByInvitation: RoomMember;
  joinRoom: RoomMembership;
  moveQuestionnaireContentToQuestionnaire?: Maybe<Content>;
  pauseQna: Qna;
  publishQuestionnaireUpToContent: Questionnaire;
  rejectQnaPost: Post;
  requestUserPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  requestUserPasswordSetup?: Maybe<Scalars['Boolean']['output']>;
  resendVerificationMail?: Maybe<Scalars['Boolean']['output']>;
  resetBannedQuestionnaireWordcloudContentKeywords?: Maybe<Content>;
  resetQuestionnaireResults?: Maybe<Scalars['Boolean']['output']>;
  resetUserPassword?: Maybe<User>;
  revokeRoomMembership: RoomMembership;
  revokeRoomRole: RoomMember;
  startQna: Qna;
  startQuestionnaireContent: Questionnaire;
  startQuestionnaireContentRound: Round;
  stopQna: Qna;
  stopQuestionnaireContent: Questionnaire;
  toggleQuestionnairePublished: Questionnaire;
  updateAnnouncement: Announcement;
  updateQnaActivePostId: Qna;
  updateQnaAutoPublish: Qna;
  updateQnaPostCorrect: Post;
  updateQnaPostFavorite: Post;
  updateQnaReply: Reply;
  updateQnaThreshold: Qna;
  updateQuestionnaire: Questionnaire;
  updateQuestionnaireChoiceContent?: Maybe<Content>;
  updateQuestionnaireContentOrder?: Maybe<Questionnaire>;
  updateQuestionnaireWordcloudContent?: Maybe<Content>;
  updateRoomDescription: Room;
  updateRoomFocusMode: Room;
  updateRoomLanguage: Room;
  updateRoomName: Room;
  updateUserDetails?: Maybe<User>;
  updateUserLanguage?: Maybe<User>;
  updateUserMailAddress?: Maybe<User>;
  updateUserPassword?: Maybe<User>;
  updateUserUiSettings?: Maybe<UserUiSettings>;
  verifyUserMailAddress?: Maybe<User>;
  verifyUserMailAddressUnauthenticated?: Maybe<User>;
  voteQnaPost: Post;
};

export type MutationAcceptQnaPostArgs = {
  id: Scalars['ID']['input'];
};

export type MutationAdminCreateUserArgs = {
  mailAddress: Scalars['String']['input'];
};

export type MutationAdminDeleteRoomByIdArgs = {
  id: Scalars['ID']['input'];
};

export type MutationAdminDeleteUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type MutationAdminTransferRoomArgs = {
  roomId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type MutationAdminVerifyUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type MutationBanQuestionnaireWordcloudContentKeywordArgs = {
  contentId: Scalars['UUID']['input'];
  keyword: Scalars['String']['input'];
};

export type MutationClaimUnverifiedUserArgs = {
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationCopyQuestionnaireContentToQuestionnaireArgs = {
  contentId: Scalars['UUID']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationCreateAnnouncementArgs = {
  input: CreateAnnouncementInput;
};

export type MutationCreateQnaPostArgs = {
  input: CreatePostInput;
};

export type MutationCreateQnaReplyArgs = {
  input: CreateReplyInput;
};

export type MutationCreateQnaTagArgs = {
  input?: InputMaybe<CreateTagInput>;
};

export type MutationCreateQuestionnaireArgs = {
  input: CreateQuestionnaireInput;
};

export type MutationCreateQuestionnaireAbstentionArgs = {
  roundId: Scalars['UUID']['input'];
};

export type MutationCreateQuestionnaireChoiceAnswerArgs = {
  input: CreateChoiceAnswerInput;
};

export type MutationCreateQuestionnaireChoiceContentArgs = {
  input: CreateChoiceContentInput;
};

export type MutationCreateQuestionnaireWordcloudAnswerArgs = {
  input: CreateWordcloudAnswerInput;
};

export type MutationCreateQuestionnaireWordcloudContentArgs = {
  input: CreateWordcloudContentInput;
};

export type MutationCreateRoomArgs = {
  input: CreateRoomInput;
};

export type MutationDeleteAnnouncementArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteQnaPostArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteQnaPostsByQnaIdArgs = {
  moderationState?: InputMaybe<ModerationState>;
  qnaId: Scalars['UUID']['input'];
};

export type MutationDeleteQnaReplyArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteQnaTagArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteQuestionnaireArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteQuestionnaireAnswersByContentIdArgs = {
  contentId: Scalars['UUID']['input'];
};

export type MutationDeleteQuestionnaireContentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteRoomArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDuplicateQuestionnaireArgs = {
  id: Scalars['UUID']['input'];
  newName: Scalars['String']['input'];
};

export type MutationDuplicateQuestionnaireContentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDuplicateRoomArgs = {
  input: DuplicateRoomInput;
};

export type MutationGrantRoomRoleArgs = {
  role: RoomRole;
  roomId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};

export type MutationGrantRoomRoleByInvitationArgs = {
  mailAddress: Scalars['String']['input'];
  role: RoomRole;
  roomId: Scalars['UUID']['input'];
};

export type MutationJoinRoomArgs = {
  input: JoinRoomInput;
};

export type MutationMoveQuestionnaireContentToQuestionnaireArgs = {
  contentId: Scalars['UUID']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationPauseQnaArgs = {
  id: Scalars['ID']['input'];
};

export type MutationPublishQuestionnaireUpToContentArgs = {
  contentId: Scalars['UUID']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationRejectQnaPostArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRequestUserPasswordResetArgs = {
  mailAddress: Scalars['String']['input'];
};

export type MutationResetBannedQuestionnaireWordcloudContentKeywordsArgs = {
  contentId: Scalars['UUID']['input'];
};

export type MutationResetQuestionnaireResultsArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationResetUserPasswordArgs = {
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
};

export type MutationRevokeRoomMembershipArgs = {
  roomId: Scalars['UUID']['input'];
};

export type MutationRevokeRoomRoleArgs = {
  roomId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};

export type MutationStartQnaArgs = {
  id: Scalars['ID']['input'];
};

export type MutationStartQuestionnaireContentArgs = {
  contentId: Scalars['UUID']['input'];
};

export type MutationStartQuestionnaireContentRoundArgs = {
  contentId: Scalars['UUID']['input'];
};

export type MutationStopQnaArgs = {
  id: Scalars['ID']['input'];
};

export type MutationStopQuestionnaireContentArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationToggleQuestionnairePublishedArgs = {
  id: Scalars['UUID']['input'];
  published: Scalars['Boolean']['input'];
};

export type MutationUpdateAnnouncementArgs = {
  input?: InputMaybe<UpdateAnnouncementInput>;
};

export type MutationUpdateQnaActivePostIdArgs = {
  activePostId?: InputMaybe<Scalars['UUID']['input']>;
  id: Scalars['ID']['input'];
};

export type MutationUpdateQnaAutoPublishArgs = {
  autoPublish: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type MutationUpdateQnaPostCorrectArgs = {
  correct: CorrectState;
  id: Scalars['ID']['input'];
};

export type MutationUpdateQnaPostFavoriteArgs = {
  favorite: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type MutationUpdateQnaReplyArgs = {
  body: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type MutationUpdateQnaThresholdArgs = {
  id: Scalars['ID']['input'];
  threshold?: InputMaybe<Scalars['Int']['input']>;
};

export type MutationUpdateQuestionnaireArgs = {
  input: UpdateQuestionnaireInput;
};

export type MutationUpdateQuestionnaireChoiceContentArgs = {
  input: UpdateChoiceContentInput;
};

export type MutationUpdateQuestionnaireContentOrderArgs = {
  contentIds: Array<Scalars['UUID']['input']>;
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationUpdateQuestionnaireWordcloudContentArgs = {
  input: UpdateWordcloudContentInput;
};

export type MutationUpdateRoomDescriptionArgs = {
  description: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};

export type MutationUpdateRoomFocusModeArgs = {
  enabled: Scalars['Boolean']['input'];
  id: Scalars['ID']['input'];
};

export type MutationUpdateRoomLanguageArgs = {
  id: Scalars['ID']['input'];
  languageCode?: InputMaybe<Scalars['String']['input']>;
};

export type MutationUpdateRoomNameArgs = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type MutationUpdateUserDetailsArgs = {
  input: UpdateUserDetailsInput;
};

export type MutationUpdateUserLanguageArgs = {
  languageCode: Scalars['String']['input'];
};

export type MutationUpdateUserMailAddressArgs = {
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationUpdateUserPasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};

export type MutationUpdateUserUiSettingsArgs = {
  input: UpdateUserUiSettingsInput;
};

export type MutationVerifyUserMailAddressArgs = {
  verificationCode: Scalars['String']['input'];
};

export type MutationVerifyUserMailAddressUnauthenticatedArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['UUID']['input'];
  verificationCode: Scalars['String']['input'];
};

export type MutationVoteQnaPostArgs = {
  input?: InputMaybe<VoteInput>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Post = {
  __typename?: 'Post';
  body: Scalars['String']['output'];
  correct?: Maybe<CorrectState>;
  createdAt: Scalars['DateTime']['output'];
  favorite?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  moderationState: ModerationState;
  replies?: Maybe<Array<Reply>>;
  score?: Maybe<Scalars['Int']['output']>;
  tags?: Maybe<Array<Tag>>;
  userVote?: Maybe<Scalars['Int']['output']>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges?: Maybe<Array<Maybe<PostEdge>>>;
  pageInfo: PageInfo;
};

export type PostCountSummary = {
  __typename?: 'PostCountSummary';
  accepted: Scalars['Int']['output'];
  rejected: Scalars['Int']['output'];
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node: Post;
};

export type PostQueryInput = {
  correct?: InputMaybe<CorrectState>;
  favorite?: InputMaybe<Scalars['Boolean']['input']>;
  moderationState?: InputMaybe<ModerationState>;
  period?: InputMaybe<Scalars['Int']['input']>;
  qnaId: Scalars['UUID']['input'];
  replied?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<PostSortOrder>;
  tagIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export enum PostSortOrder {
  HighestScore = 'HIGHEST_SCORE',
  LowestScore = 'LOWEST_SCORE',
  Newest = 'NEWEST',
}

export type Qna = {
  __typename?: 'Qna';
  activePost?: Maybe<Post>;
  autoPublish?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  roomId: Scalars['UUID']['output'];
  state?: Maybe<QnaState>;
  tags?: Maybe<Array<Tag>>;
  threshold?: Maybe<Scalars['Int']['output']>;
  topic?: Maybe<Scalars['String']['output']>;
};

export type QnaConnection = {
  __typename?: 'QnaConnection';
  edges?: Maybe<Array<Maybe<QnaEdge>>>;
  pageInfo: PageInfo;
};

export type QnaEdge = {
  __typename?: 'QnaEdge';
  cursor: Scalars['String']['output'];
  node: Qna;
};

export enum QnaState {
  Paused = 'PAUSED',
  Started = 'STARTED',
  Stopped = 'STOPPED',
}

export type Query = {
  __typename?: 'Query';
  adminActiveRoomStats?: Maybe<AdminActiveRoomStats>;
  adminAnnouncementStats?: Maybe<AdminAnnouncementStats>;
  adminQnaStats?: Maybe<AdminQnaStats>;
  adminRoomActivityStats: AdminRoomActivityStats;
  adminRoomById?: Maybe<AdminRoom>;
  adminRoomManagingMembersByRoomId?: Maybe<Array<RoomMember>>;
  adminRoomMembershipsByUserId?: Maybe<RoomMembershipConnection>;
  adminRoomStats?: Maybe<AdminRoomStats>;
  adminRooms?: Maybe<AdminRoomConnection>;
  adminUserById?: Maybe<AdminUser>;
  adminUserStats?: Maybe<AdminUserStats>;
  adminUsers?: Maybe<AdminUserConnection>;
  announcementsByRoomId?: Maybe<AnnouncementConnection>;
  announcementsByUserId?: Maybe<AnnouncementConnection>;
  announcementsForCurrentUser?: Maybe<AnnouncementConnection>;
  announcementsMetaForCurrentUser?: Maybe<AnnouncementsMeta>;
  currentUser?: Maybe<User>;
  publishedQuestionnairesByRoomId?: Maybe<Array<Questionnaire>>;
  qnaPostCountsByQnaId?: Maybe<PostCountSummary>;
  qnaPostsByQnaId?: Maybe<PostConnection>;
  qnasByRoomId?: Maybe<QnaConnection>;
  questionnaireAnswerByRoundId?: Maybe<Answer>;
  questionnaireAnswerResultsByQuestionnaireId?: Maybe<QuestionnaireAnswerResult>;
  questionnaireById?: Maybe<Questionnaire>;
  questionnaireChoiceRoundStatsByRoundId?: Maybe<ChoiceContentRoundStats>;
  questionnaireContentAnswerResultsByQuestionnaireId?: Maybe<
    Array<ContentAnswerResult>
  >;
  questionnaireContentById?: Maybe<Content>;
  questionnaireContentsByQuestionnaireId?: Maybe<ContentConnection>;
  questionnairePublishedContentsByQuestionnaireId?: Maybe<ContentConnection>;
  questionnaireRoundsByContentId?: Maybe<Array<Round>>;
  questionnaireWordcloudRoundStatsByRoundId?: Maybe<WordcloudContentRoundStats>;
  questionnairesByRoomId?: Maybe<Array<Questionnaire>>;
  roomById?: Maybe<Room>;
  roomByShortId?: Maybe<Room>;
  roomManagingMembersByRoomId?: Maybe<Array<RoomMember>>;
  roomMembershipById?: Maybe<RoomMembership>;
  roomMembershipByShortId?: Maybe<RoomMembership>;
  roomMemberships?: Maybe<RoomMembershipConnection>;
  rooms?: Maybe<RoomConnection>;
  roomsByUserId?: Maybe<RoomMembershipConnection>;
  userByDisplayId?: Maybe<User>;
};

export type QueryAdminActiveRoomStatsArgs = {
  activityWindowMinutes?: InputMaybe<Scalars['Int']['input']>;
  minMemberCount?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryAdminRoomActivityStatsArgs = {
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
};

export type QueryAdminRoomByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryAdminRoomManagingMembersByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryAdminRoomMembershipsByUserIdArgs = {
  userId: Scalars['UUID']['input'];
};

export type QueryAdminRoomsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAdminUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryAdminUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  exactSearchMode?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAnnouncementsByRoomIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  roomId: Scalars['UUID']['input'];
};

export type QueryAnnouncementsByUserIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
};

export type QueryAnnouncementsForCurrentUserArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPublishedQuestionnairesByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryQnaPostCountsByQnaIdArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type QueryQnaPostsByQnaIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<PostQueryInput>;
};

export type QueryQnasByRoomIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  roomId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireAnswerByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireAnswerResultsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryQuestionnaireChoiceRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireContentAnswerResultsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireContentByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryQuestionnaireContentsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnairePublishedContentsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireRoundsByContentIdArgs = {
  contentId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireWordcloudRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnairesByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryRoomByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRoomByShortIdArgs = {
  shortId: Scalars['String']['input'];
};

export type QueryRoomManagingMembersByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryRoomMembershipByIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryRoomMembershipByShortIdArgs = {
  shortId: Scalars['String']['input'];
};

export type QueryRoomMembershipsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<RoomQueryInput>;
};

export type QueryRoomsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  room: RoomQueryInput;
};

export type QueryRoomsByUserIdArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['UUID']['input'];
};

export type QueryUserByDisplayIdArgs = {
  displayId: Scalars['ID']['input'];
};

export type Questionnaire = {
  __typename?: 'Questionnaire';
  activeRound?: Maybe<Round>;
  contentCount?: Maybe<Scalars['Int']['output']>;
  correctOptionsPublished?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  leaderboardEnabled?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  published: Scalars['Boolean']['output'];
  publishedUpToContent?: Maybe<Content>;
  publishingMode: QuestionnairePublishingMode;
  statisticsPublished?: Maybe<Scalars['Boolean']['output']>;
  type: QuestionnaireType;
};

export type QuestionnaireAnswerResult = {
  __typename?: 'QuestionnaireAnswerResult';
  achievedScore?: Maybe<Scalars['Int']['output']>;
  correctAnswerCount?: Maybe<Scalars['Int']['output']>;
  maxScore?: Maybe<Scalars['Int']['output']>;
  questionnaireId: Scalars['UUID']['output'];
  scorableContentCount?: Maybe<Scalars['Int']['output']>;
};

export enum QuestionnairePublishingMode {
  All = 'ALL',
  Live = 'LIVE',
  UpTo = 'UP_TO',
}

export enum QuestionnaireType {
  Flashcards = 'FLASHCARDS',
  Mixed = 'MIXED',
  Quiz = 'QUIZ',
  Survey = 'SURVEY',
}

export type Reply = {
  __typename?: 'Reply';
  body: Scalars['String']['output'];
  bodyRendered?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
};

export type Room = {
  __typename?: 'Room';
  description?: Maybe<Scalars['String']['output']>;
  descriptionRendered?: Maybe<Scalars['String']['output']>;
  focusModeEnabled?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  shortId: Scalars['ID']['output'];
  stats?: Maybe<RoomStats>;
};

export type RoomConnection = {
  __typename?: 'RoomConnection';
  edges?: Maybe<Array<Maybe<RoomEdge>>>;
  pageInfo: PageInfo;
};

export type RoomEdge = {
  __typename?: 'RoomEdge';
  cursor: Scalars['String']['output'];
  node: Room;
};

export type RoomMember = {
  __typename?: 'RoomMember';
  role?: Maybe<RoomRole>;
  room: Room;
  user: User;
};

export type RoomMembership = {
  __typename?: 'RoomMembership';
  lastActivityAt: Scalars['DateTime']['output'];
  role: RoomRole;
  room: Room;
};

export type RoomMembershipConnection = {
  __typename?: 'RoomMembershipConnection';
  edges?: Maybe<Array<Maybe<RoomMembershipEdge>>>;
  pageInfo: PageInfo;
};

export type RoomMembershipEdge = {
  __typename?: 'RoomMembershipEdge';
  cursor: Scalars['String']['output'];
  node: RoomMembership;
};

export type RoomQueryInput = {
  anyRole?: InputMaybe<Array<RoomRole>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  shortId?: InputMaybe<Scalars['ID']['input']>;
};

export type RoomQueryUserInput = {
  id: Scalars['ID']['input'];
};

export enum RoomRole {
  Editor = 'EDITOR',
  Moderator = 'MODERATOR',
  None = 'NONE',
  Owner = 'OWNER',
  Participant = 'PARTICIPANT',
}

export type RoomStats = {
  __typename?: 'RoomStats';
  activeMemberCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
};

export type Round = {
  __typename?: 'Round';
  answerable: Scalars['Boolean']['output'];
  answeringEndTime?: Maybe<Scalars['DateTime']['output']>;
  closed: Scalars['Boolean']['output'];
  contentId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  roundNo: Scalars['Int']['output'];
  started: Scalars['Boolean']['output'];
};

export type ScaleContentFormatData = {
  __typename?: 'ScaleContentFormatData';
  format: ContentType;
};

export type Subscription = {
  __typename?: 'Subscription';
  activeQnaPostUpdated?: Maybe<Qna>;
  qnaPostAccepted: Post;
  qnaPostCountSummary: PostCountSummary;
  qnaPostCreated: Post;
  qnaPostDeleted: Post;
  qnaPostMarkedCorrect: Post;
  qnaPostMarkedFavorite: Post;
  qnaPostRejected: Post;
  qnaPostReplied: CreateReplyEvent;
  qnaPostVoted: Post;
  qnaStateChanged?: Maybe<Qna>;
  questionnaireChoiceRoundStatsUpdated?: Maybe<ChoiceContentRoundStats>;
  questionnaireContentUpdated?: Maybe<Content>;
  questionnaireUpdated?: Maybe<Questionnaire>;
  questionnaireWordcloudRoundStatsUpdated?: Maybe<WordcloudContentRoundStats>;
  questionnairesChanged: Scalars['ID']['output'];
};

export type SubscriptionActiveQnaPostUpdatedArgs = {
  roomId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostAcceptedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostCountSummaryArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostCreatedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostDeletedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostMarkedCorrectArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostMarkedFavoriteArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostRejectedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostRepliedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaPostVotedArgs = {
  qnaId: Scalars['UUID']['input'];
};

export type SubscriptionQnaStateChangedArgs = {
  roomId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireChoiceRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireContentUpdatedArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireUpdatedArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireWordcloudRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnairesChangedArgs = {
  roomId: Scalars['UUID']['input'];
};

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type TextContentFormatData = {
  __typename?: 'TextContentFormatData';
  format: ContentType;
};

export type UpdateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateChoiceContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctOptionIndexes?: InputMaybe<Array<Scalars['Int']['input']>>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  multiple?: InputMaybe<Scalars['Boolean']['input']>;
  options: Array<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateQuestionnaireInput = {
  correctOptionsPublished?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['UUID']['input'];
  leaderboardEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  publishingMode?: InputMaybe<QuestionnairePublishingMode>;
  statisticsPublished?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateUserDetailsInput = {
  givenName?: InputMaybe<Scalars['String']['input']>;
  surname?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserUiSettingsInput = {
  contentAnswersDirectlyBelowChart?: InputMaybe<Scalars['Boolean']['input']>;
  contentVisualizationUnitPercent?: InputMaybe<Scalars['Boolean']['input']>;
  rotateWordcloudItems?: InputMaybe<Scalars['Boolean']['input']>;
  showContentResultsDirectly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateWordcloudContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  maxAnswers: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  displayId?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  localPasswordSet?: Maybe<Scalars['Boolean']['output']>;
  mailAddress?: Maybe<Scalars['String']['output']>;
  uiSettings?: Maybe<UserUiSettings>;
  unverifiedMailAddress?: Maybe<Scalars['String']['output']>;
  verified: Scalars['Boolean']['output'];
};

export type UserUiSettings = {
  __typename?: 'UserUiSettings';
  contentAnswersDirectlyBelowChart?: Maybe<Scalars['Boolean']['output']>;
  contentVisualizationUnitPercent?: Maybe<Scalars['Boolean']['output']>;
  rotateWordcloudItems?: Maybe<Scalars['Boolean']['output']>;
  showContentResultsDirectly?: Maybe<Scalars['Boolean']['output']>;
};

export type VoteInput = {
  postId: Scalars['UUID']['input'];
  value: Scalars['Int']['input'];
};

export type WordcloudAnswerFormatData = {
  __typename?: 'WordcloudAnswerFormatData';
  format: ContentType;
  words: Array<Scalars['String']['output']>;
};

export type WordcloudContentFormatData = {
  __typename?: 'WordcloudContentFormatData';
  format: ContentType;
  maxAnswers: Scalars['Int']['output'];
};

export type WordcloudContentRoundStats = {
  __typename?: 'WordcloudContentRoundStats';
  counts?: Maybe<Array<Scalars['Int']['output']>>;
  words?: Maybe<Array<Scalars['String']['output']>>;
};

export type AdminUserDetailsFragment = {
  __typename?: 'AdminUser';
  id: string;
  username?: string | null;
  displayId?: string | null;
  mailAddress?: string | null;
  unverifiedMailAddress?: string | null;
  language?: string | null;
  verificationCode?: number | null;
  verificationErrors?: number | null;
  verificationExpiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastActivityAt?: string | null;
  uiSettings?: {
    __typename?: 'UserUiSettings';
    contentAnswersDirectlyBelowChart?: boolean | null;
    contentVisualizationUnitPercent?: boolean | null;
    showContentResultsDirectly?: boolean | null;
    rotateWordcloudItems?: boolean | null;
  } | null;
};

export type AdminRoomDetailsFragment = {
  __typename?: 'AdminRoom';
  id: string;
  shortId: string;
  name: string;
  description?: string | null;
  descriptionRendered?: string | null;
  language?: string | null;
  focusModeEnabled?: boolean | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
};

export type AdminUserByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdminUserByIdQuery = {
  __typename?: 'Query';
  adminUserById?: {
    __typename?: 'AdminUser';
    id: string;
    username?: string | null;
    displayId?: string | null;
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastActivityAt?: string | null;
    uiSettings?: {
      __typename?: 'UserUiSettings';
      contentAnswersDirectlyBelowChart?: boolean | null;
      contentVisualizationUnitPercent?: boolean | null;
      showContentResultsDirectly?: boolean | null;
      rotateWordcloudItems?: boolean | null;
    } | null;
  } | null;
};

export type AdminUsersQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  exactSearchMode?: InputMaybe<Scalars['Boolean']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type AdminUsersQuery = {
  __typename?: 'Query';
  adminUsers?: {
    __typename?: 'AdminUserConnection';
    edges?: Array<{
      __typename?: 'AdminUserEdge';
      cursor: string;
      node: {
        __typename?: 'AdminUser';
        id: string;
        username?: string | null;
        displayId?: string | null;
        mailAddress?: string | null;
        unverifiedMailAddress?: string | null;
        language?: string | null;
        verificationCode?: number | null;
        verificationErrors?: number | null;
        verificationExpiresAt?: string | null;
        createdAt?: string | null;
        updatedAt?: string | null;
        lastActivityAt?: string | null;
        uiSettings?: {
          __typename?: 'UserUiSettings';
          contentAnswersDirectlyBelowChart?: boolean | null;
          contentVisualizationUnitPercent?: boolean | null;
          showContentResultsDirectly?: boolean | null;
          rotateWordcloudItems?: boolean | null;
        } | null;
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type AdminDeleteUserByIdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdminDeleteUserByIdMutation = {
  __typename?: 'Mutation';
  adminDeleteUserById: string;
};

export type AdminCreateUserMutationVariables = Exact<{
  mailAddress: Scalars['String']['input'];
}>;

export type AdminCreateUserMutation = {
  __typename?: 'Mutation';
  adminCreateUser: {
    __typename?: 'AdminUser';
    id: string;
    username?: string | null;
    displayId?: string | null;
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastActivityAt?: string | null;
    uiSettings?: {
      __typename?: 'UserUiSettings';
      contentAnswersDirectlyBelowChart?: boolean | null;
      contentVisualizationUnitPercent?: boolean | null;
      showContentResultsDirectly?: boolean | null;
      rotateWordcloudItems?: boolean | null;
    } | null;
  };
};

export type AdminVerifyUserByIdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdminVerifyUserByIdMutation = {
  __typename?: 'Mutation';
  adminVerifyUserById: {
    __typename?: 'AdminUser';
    id: string;
    username?: string | null;
    displayId?: string | null;
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    lastActivityAt?: string | null;
    uiSettings?: {
      __typename?: 'UserUiSettings';
      contentAnswersDirectlyBelowChart?: boolean | null;
      contentVisualizationUnitPercent?: boolean | null;
      showContentResultsDirectly?: boolean | null;
      rotateWordcloudItems?: boolean | null;
    } | null;
  };
};

export type AdminRoomByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdminRoomByIdQuery = {
  __typename?: 'Query';
  adminRoomById?: {
    __typename?: 'AdminRoom';
    id: string;
    shortId: string;
    name: string;
    description?: string | null;
    descriptionRendered?: string | null;
    language?: string | null;
    focusModeEnabled?: boolean | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type AdminRoomsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type AdminRoomsQuery = {
  __typename?: 'Query';
  adminRooms?: {
    __typename?: 'AdminRoomConnection';
    edges?: Array<{
      __typename?: 'AdminRoomEdge';
      cursor: string;
      node: {
        __typename?: 'AdminRoom';
        id: string;
        shortId: string;
        name: string;
        description?: string | null;
        descriptionRendered?: string | null;
        language?: string | null;
        focusModeEnabled?: boolean | null;
        createdBy?: string | null;
        createdAt?: string | null;
        updatedBy?: string | null;
        updatedAt?: string | null;
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type AdminRoomManagingMembersByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type AdminRoomManagingMembersByRoomIdQuery = {
  __typename?: 'Query';
  adminRoomManagingMembersByRoomId?: Array<{
    __typename?: 'RoomMember';
    role?: RoomRole | null;
    user: {
      __typename?: 'User';
      id: string;
      displayId?: string | null;
      displayName?: string | null;
      verified: boolean;
    };
  }> | null;
};

export type AdminDeleteRoomByIdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AdminDeleteRoomByIdMutation = {
  __typename?: 'Mutation';
  adminDeleteRoomById: string;
};

export type AdminTransferRoomMutationVariables = Exact<{
  roomId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;

export type AdminTransferRoomMutation = {
  __typename?: 'Mutation';
  adminTransferRoom: {
    __typename?: 'AdminRoom';
    id: string;
    shortId: string;
    name: string;
    description?: string | null;
    descriptionRendered?: string | null;
    language?: string | null;
    focusModeEnabled?: boolean | null;
    createdBy?: string | null;
    createdAt?: string | null;
    updatedBy?: string | null;
    updatedAt?: string | null;
  };
};

export type AdminStatsQueryVariables = Exact<{ [key: string]: never }>;

export type AdminStatsQuery = {
  __typename?: 'Query';
  adminUserStats?: {
    __typename?: 'AdminUserStats';
    totalCount: number;
    verifiedCount: number;
    pendingCount: number;
  } | null;
  adminRoomStats?: {
    __typename?: 'AdminRoomStats';
    totalCount: number;
    membershipCount: number;
    managingUserCount: number;
    participantCount: number;
  } | null;
  adminAnnouncementStats?: {
    __typename?: 'AdminAnnouncementStats';
    totalCount: number;
  } | null;
  adminQnaStats?: { __typename?: 'AdminQnaStats'; postCount: number } | null;
};

export type AdminRoomActivityStatsQueryVariables = Exact<{
  from: Scalars['DateTime']['input'];
  to: Scalars['DateTime']['input'];
}>;

export type AdminRoomActivityStatsQuery = {
  __typename?: 'Query';
  adminRoomActivityStats: {
    __typename?: 'AdminRoomActivityStats';
    managingUserCount: number;
    participantCount: number;
    roomCount: number;
  };
};

export type ActiveRoomStatsQueryVariables = Exact<{
  minMemberCount?: InputMaybe<Scalars['Int']['input']>;
  activityWindowMinutes?: InputMaybe<Scalars['Int']['input']>;
}>;

export type ActiveRoomStatsQuery = {
  __typename?: 'Query';
  adminActiveRoomStats?: {
    __typename?: 'AdminActiveRoomStats';
    count: number;
    minMemberCount: number;
    activityWindowMinutes: number;
  } | null;
};

export type AdminUserCountQueryVariables = Exact<{ [key: string]: never }>;

export type AdminUserCountQuery = {
  __typename?: 'Query';
  adminUserStats?: {
    __typename?: 'AdminUserStats';
    verifiedCount: number;
    pendingCount: number;
  } | null;
};

export type AdminRoomCountQueryVariables = Exact<{ [key: string]: never }>;

export type AdminRoomCountQuery = {
  __typename?: 'Query';
  adminRoomStats?: { __typename?: 'AdminRoomStats'; totalCount: number } | null;
};

export type AdminRoomMembershipsByUserIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;

export type AdminRoomMembershipsByUserIdQuery = {
  __typename?: 'Query';
  adminRoomMembershipsByUserId?: {
    __typename?: 'RoomMembershipConnection';
    edges?: Array<{
      __typename?: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename?: 'RoomMembership';
        role: RoomRole;
        room: {
          __typename?: 'Room';
          id: string;
          shortId: string;
          name: string;
          description?: string | null;
          descriptionRendered?: string | null;
          language?: string | null;
          focusModeEnabled?: boolean | null;
          stats?: {
            __typename?: 'RoomStats';
            id: string;
            activeMemberCount?: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type AnnouncementsMetaForCurrentUserQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AnnouncementsMetaForCurrentUserQuery = {
  __typename?: 'Query';
  announcementsMetaForCurrentUser?: {
    __typename?: 'AnnouncementsMeta';
    count: number;
    readAt?: string | null;
  } | null;
};

export type AnnoucentmentsByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type AnnoucentmentsByRoomIdQuery = {
  __typename?: 'Query';
  announcementsByRoomId?: {
    __typename?: 'AnnouncementConnection';
    edges?: Array<{
      __typename?: 'AnnouncementEdge';
      node: {
        __typename?: 'Announcement';
        id: string;
        body: string;
        bodyRendered?: string | null;
        createdAt: string;
        updatedAt?: string | null;
        title: string;
      };
    } | null> | null;
  } | null;
};

export type AnnouncementsForCurrentUserQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AnnouncementsForCurrentUserQuery = {
  __typename?: 'Query';
  announcementsForCurrentUser?: {
    __typename?: 'AnnouncementConnection';
    edges?: Array<{
      __typename?: 'AnnouncementEdge';
      node: {
        __typename?: 'Announcement';
        body: string;
        bodyRendered?: string | null;
        createdAt: string;
        updatedAt?: string | null;
        id: string;
        title: string;
        room?: { __typename?: 'Room'; id: string; name: string } | null;
      };
    } | null> | null;
  } | null;
};

export type CreateAnnouncementMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
  title: Scalars['String']['input'];
  body: Scalars['String']['input'];
}>;

export type CreateAnnouncementMutation = {
  __typename?: 'Mutation';
  createAnnouncement: {
    __typename?: 'Announcement';
    body: string;
    bodyRendered?: string | null;
    createdAt: string;
    title: string;
    id: string;
  };
};

export type UpdateAnnouncementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateAnnouncementMutation = {
  __typename?: 'Mutation';
  updateAnnouncement: {
    __typename?: 'Announcement';
    body: string;
    bodyRendered?: string | null;
    updatedAt?: string | null;
    title: string;
    id: string;
  };
};

export type DeleteAnnouncementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteAnnouncementMutation = {
  __typename?: 'Mutation';
  deleteAnnouncement: string;
};

export type PostDetailsFragment = {
  __typename?: 'Post';
  id: string;
  body: string;
  correct?: CorrectState | null;
  favorite?: boolean | null;
  createdAt: string;
  score?: number | null;
  userVote?: number | null;
  moderationState: ModerationState;
  tags?: Array<{ __typename?: 'Tag'; name: string; id: string }> | null;
  replies?: Array<{
    __typename?: 'Reply';
    id: string;
    body: string;
    bodyRendered?: string | null;
    createdAt: string;
  }> | null;
};

export type ReplyDetailsFragment = {
  __typename?: 'Reply';
  id: string;
  body: string;
  bodyRendered?: string | null;
  createdAt: string;
};

export type QnasByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type QnasByRoomIdQuery = {
  __typename?: 'Query';
  qnasByRoomId?: {
    __typename?: 'QnaConnection';
    edges?: Array<{
      __typename?: 'QnaEdge';
      node: {
        __typename?: 'Qna';
        id: string;
        topic?: string | null;
        state?: QnaState | null;
        autoPublish?: boolean | null;
        threshold?: number | null;
        activePost?: {
          __typename?: 'Post';
          id: string;
          body: string;
          createdAt: string;
        } | null;
        tags?: Array<{ __typename?: 'Tag'; id: string; name: string }> | null;
      };
    } | null> | null;
  } | null;
};

export type StartQnaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type StartQnaMutation = {
  __typename?: 'Mutation';
  startQna: { __typename?: 'Qna'; id: string; state?: QnaState | null };
};

export type PauseQnaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type PauseQnaMutation = {
  __typename?: 'Mutation';
  pauseQna: { __typename?: 'Qna'; id: string; state?: QnaState | null };
};

export type StopQnaMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type StopQnaMutation = {
  __typename?: 'Mutation';
  stopQna: { __typename?: 'Qna'; id: string; state?: QnaState | null };
};

export type UpdateQnaAutoPublishMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  autoPublish: Scalars['Boolean']['input'];
}>;

export type UpdateQnaAutoPublishMutation = {
  __typename?: 'Mutation';
  updateQnaAutoPublish: {
    __typename?: 'Qna';
    id: string;
    autoPublish?: boolean | null;
  };
};

export type UpdateQnaThresholdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  threshold?: InputMaybe<Scalars['Int']['input']>;
}>;

export type UpdateQnaThresholdMutation = {
  __typename?: 'Mutation';
  updateQnaThreshold: {
    __typename?: 'Qna';
    id: string;
    threshold?: number | null;
  };
};

export type UpdateQnaActivePostIdMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  activePostId?: InputMaybe<Scalars['UUID']['input']>;
}>;

export type UpdateQnaActivePostIdMutation = {
  __typename?: 'Mutation';
  updateQnaActivePostId: {
    __typename?: 'Qna';
    id: string;
    activePost?: {
      __typename?: 'Post';
      id: string;
      body: string;
      createdAt: string;
    } | null;
  };
};

export type QnaPostsByQnaIdQueryVariables = Exact<{
  query?: InputMaybe<PostQueryInput>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type QnaPostsByQnaIdQuery = {
  __typename?: 'Query';
  qnaPostsByQnaId?: {
    __typename?: 'PostConnection';
    edges?: Array<{
      __typename?: 'PostEdge';
      cursor: string;
      node: {
        __typename?: 'Post';
        id: string;
        body: string;
        correct?: CorrectState | null;
        favorite?: boolean | null;
        createdAt: string;
        score?: number | null;
        userVote?: number | null;
        moderationState: ModerationState;
        tags?: Array<{ __typename?: 'Tag'; name: string; id: string }> | null;
        replies?: Array<{
          __typename?: 'Reply';
          id: string;
          body: string;
          bodyRendered?: string | null;
          createdAt: string;
        }> | null;
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type QnaPostCountsByQnaIdQueryVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostCountsByQnaIdQuery = {
  __typename?: 'Query';
  qnaPostCountsByQnaId?: {
    __typename?: 'PostCountSummary';
    accepted: number;
    rejected: number;
  } | null;
};

export type QnaPostCountSummarySubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostCountSummarySubscription = {
  __typename?: 'Subscription';
  qnaPostCountSummary: {
    __typename?: 'PostCountSummary';
    accepted: number;
    rejected: number;
  };
};

export type CreateQnaPostMutationVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
  body: Scalars['String']['input'];
  tagIds?: InputMaybe<
    Array<Scalars['UUID']['input']> | Scalars['UUID']['input']
  >;
}>;

export type CreateQnaPostMutation = {
  __typename?: 'Mutation';
  createQnaPost: {
    __typename?: 'Post';
    id: string;
    body: string;
    correct?: CorrectState | null;
    favorite?: boolean | null;
    createdAt: string;
    score?: number | null;
    userVote?: number | null;
    tags?: Array<{ __typename?: 'Tag'; id: string; name: string }> | null;
  };
};

export type UpdateQnaPostFavoriteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  favorite: Scalars['Boolean']['input'];
}>;

export type UpdateQnaPostFavoriteMutation = {
  __typename?: 'Mutation';
  updateQnaPostFavorite: {
    __typename?: 'Post';
    id: string;
    favorite?: boolean | null;
  };
};

export type UpdateQnaPostCorrectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  correct: CorrectState;
}>;

export type UpdateQnaPostCorrectMutation = {
  __typename?: 'Mutation';
  updateQnaPostCorrect: {
    __typename?: 'Post';
    id: string;
    correct?: CorrectState | null;
  };
};

export type AcceptQnaPostMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type AcceptQnaPostMutation = {
  __typename?: 'Mutation';
  acceptQnaPost: {
    __typename?: 'Post';
    id: string;
    moderationState: ModerationState;
  };
};

export type RejectQnaPostMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RejectQnaPostMutation = {
  __typename?: 'Mutation';
  rejectQnaPost: {
    __typename?: 'Post';
    id: string;
    moderationState: ModerationState;
  };
};

export type DeleteQnaPostMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteQnaPostMutation = {
  __typename?: 'Mutation';
  deleteQnaPost: string;
};

export type DeleteQnaPostsMutationVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
  moderationState?: InputMaybe<ModerationState>;
}>;

export type DeleteQnaPostsMutation = {
  __typename?: 'Mutation';
  deleteQnaPostsByQnaId: number;
};

export type CreateQnaTagMutationVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
}>;

export type CreateQnaTagMutation = {
  __typename?: 'Mutation';
  createQnaTag: { __typename?: 'Tag'; id: string; name: string };
};

export type DeleteQnaTagMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteQnaTagMutation = {
  __typename?: 'Mutation';
  deleteQnaTag: string;
};

export type CreateQnaReplyMutationVariables = Exact<{
  postId: Scalars['UUID']['input'];
  body: Scalars['String']['input'];
}>;

export type CreateQnaReplyMutation = {
  __typename?: 'Mutation';
  createQnaReply: {
    __typename?: 'Reply';
    id: string;
    body: string;
    bodyRendered?: string | null;
    createdAt: string;
  };
};

export type UpdateQnaReplyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  body: Scalars['String']['input'];
}>;

export type UpdateQnaReplyMutation = {
  __typename?: 'Mutation';
  updateQnaReply: {
    __typename?: 'Reply';
    id: string;
    body: string;
    bodyRendered?: string | null;
    createdAt: string;
  };
};

export type DeleteQnaReplyMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteQnaReplyMutation = {
  __typename?: 'Mutation';
  deleteQnaReply: string;
};

export type VoteQnaPostMutationVariables = Exact<{
  postId: Scalars['UUID']['input'];
  value: Scalars['Int']['input'];
}>;

export type VoteQnaPostMutation = {
  __typename?: 'Mutation';
  voteQnaPost: {
    __typename?: 'Post';
    id: string;
    score?: number | null;
    userVote?: number | null;
  };
};

export type QnaStateChangedSubscriptionVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type QnaStateChangedSubscription = {
  __typename?: 'Subscription';
  qnaStateChanged?: {
    __typename?: 'Qna';
    id: string;
    state?: QnaState | null;
  } | null;
};

export type ActiveQnaPostUpdatedSubscriptionVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type ActiveQnaPostUpdatedSubscription = {
  __typename?: 'Subscription';
  activeQnaPostUpdated?: {
    __typename?: 'Qna';
    id: string;
    activePost?: { __typename?: 'Post'; id: string } | null;
  } | null;
};

export type QnaPostCreatedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostCreatedSubscription = {
  __typename?: 'Subscription';
  qnaPostCreated: { __typename?: 'Post'; id: string };
};

export type QnaPostDeletedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostDeletedSubscription = {
  __typename?: 'Subscription';
  qnaPostDeleted: { __typename?: 'Post'; id: string };
};

export type QnaPostAcceptedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostAcceptedSubscription = {
  __typename?: 'Subscription';
  qnaPostAccepted: { __typename?: 'Post'; id: string };
};

export type QnaPostRejectedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostRejectedSubscription = {
  __typename?: 'Subscription';
  qnaPostRejected: { __typename?: 'Post'; id: string };
};

export type QnaPostRepliedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostRepliedSubscription = {
  __typename?: 'Subscription';
  qnaPostReplied: {
    __typename?: 'CreateReplyEvent';
    postId: string;
    reply: {
      __typename?: 'Reply';
      id: string;
      body: string;
      bodyRendered?: string | null;
      createdAt: string;
    };
  };
};

export type QnaPostMarkedFavoriteSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostMarkedFavoriteSubscription = {
  __typename?: 'Subscription';
  qnaPostMarkedFavorite: {
    __typename?: 'Post';
    id: string;
    favorite?: boolean | null;
  };
};

export type QnaPostMarkedCorrectSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostMarkedCorrectSubscription = {
  __typename?: 'Subscription';
  qnaPostMarkedCorrect: {
    __typename?: 'Post';
    id: string;
    correct?: CorrectState | null;
  };
};

export type QnaPostVotedSubscriptionVariables = Exact<{
  qnaId: Scalars['UUID']['input'];
}>;

export type QnaPostVotedSubscription = {
  __typename?: 'Subscription';
  qnaPostVoted: { __typename?: 'Post'; id: string; score?: number | null };
};

export type QuestionnaireSummaryFragment = {
  __typename?: 'Questionnaire';
  id: string;
  name: string;
  type: QuestionnaireType;
  published: boolean;
  publishingMode: QuestionnairePublishingMode;
  contentCount?: number | null;
  publishedUpToContent?: {
    __typename?: 'Content';
    id: string;
    position?: number | null;
  } | null;
};

export type RoundFragment = {
  __typename?: 'Round';
  id: string;
  contentId?: string | null;
  roundNo: number;
  closed: boolean;
  started: boolean;
  answerable: boolean;
};

export type QuestionnaireDetailsFragment = {
  __typename?: 'Questionnaire';
  id: string;
  name: string;
  type: QuestionnaireType;
  published: boolean;
  publishingMode: QuestionnairePublishingMode;
  statisticsPublished?: boolean | null;
  correctOptionsPublished?: boolean | null;
  leaderboardEnabled?: boolean | null;
  contentCount?: number | null;
  publishedUpToContent?: {
    __typename?: 'Content';
    id: string;
    position?: number | null;
  } | null;
  activeRound?: {
    __typename?: 'Round';
    id: string;
    contentId?: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answerable: boolean;
  } | null;
};

export type ContentDetailsFragment = {
  __typename?: 'Content';
  id: string;
  body: string;
  bodyRendered?: string | null;
  duration?: number | null;
  abstentionsAllowed?: boolean | null;
  hasCorrectAnswer?: boolean | null;
  weight?: number | null;
  answerCount?: number | null;
  abstentionCount?: number | null;
  position?: number | null;
  activeRound?: {
    __typename?: 'Round';
    id: string;
    contentId?: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answerable: boolean;
  } | null;
  formatData:
    | {
        __typename?: 'ChoiceContentFormatData';
        format: ContentType;
        correctOptionIndexes?: Array<number> | null;
        multiple?: boolean | null;
        options: Array<{
          __typename?: 'AnswerOption';
          label: string;
          labelRendered?: string | null;
        }>;
      }
    | { __typename?: 'ScaleContentFormatData'; format: ContentType }
    | { __typename?: 'TextContentFormatData'; format: ContentType }
    | {
        __typename?: 'WordcloudContentFormatData';
        format: ContentType;
        maxAnswers: number;
      };
};

export type CreatorContentDetailsFragment = {
  __typename?: 'Content';
  correctAnswerCount?: number | null;
  hasAnswers: boolean;
  id: string;
  body: string;
  bodyRendered?: string | null;
  duration?: number | null;
  abstentionsAllowed?: boolean | null;
  hasCorrectAnswer?: boolean | null;
  weight?: number | null;
  answerCount?: number | null;
  abstentionCount?: number | null;
  position?: number | null;
  activeRound?: {
    __typename?: 'Round';
    id: string;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answerable: boolean;
  } | null;
  formatData:
    | {
        __typename?: 'ChoiceContentFormatData';
        format: ContentType;
        correctOptionIndexes?: Array<number> | null;
        multiple?: boolean | null;
        options: Array<{
          __typename?: 'AnswerOption';
          label: string;
          labelRendered?: string | null;
        }>;
      }
    | { __typename?: 'ScaleContentFormatData'; format: ContentType }
    | { __typename?: 'TextContentFormatData'; format: ContentType }
    | {
        __typename?: 'WordcloudContentFormatData';
        format: ContentType;
        maxAnswers: number;
      };
};

export type AnswerFragment = {
  __typename?: 'Answer';
  id: string;
  result: AnswerResultState;
  formatData?:
    | {
        __typename?: 'ChoiceAnswerFormatData';
        format: ContentType;
        selectedChoiceIndexes: Array<number>;
      }
    | {
        __typename?: 'WordcloudAnswerFormatData';
        format: ContentType;
        words: Array<string>;
      }
    | null;
};

export type ContentAnswerResultFragment = {
  __typename?: 'ContentAnswerResult';
  contentId: string;
  result: AnswerResultState;
  durationMs?: number | null;
};

export type QuestionnaireAnswerResultFragment = {
  __typename?: 'QuestionnaireAnswerResult';
  correctAnswerCount?: number | null;
  scorableContentCount?: number | null;
  achievedScore?: number | null;
  maxScore?: number | null;
};

export type ChoiceContentRoundStatsFragment = {
  __typename?: 'ChoiceContentRoundStats';
  selectionCounts?: Array<number> | null;
};

export type WordcloudContentRoundStatsFragment = {
  __typename?: 'WordcloudContentRoundStats';
  words?: Array<string> | null;
  counts?: Array<number> | null;
};

export type QuestionnairesByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type QuestionnairesByRoomIdQuery = {
  __typename?: 'Query';
  questionnairesByRoomId?: Array<{
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
  }> | null;
};

export type PublishedQuestionnairesByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type PublishedQuestionnairesByRoomIdQuery = {
  __typename?: 'Query';
  publishedQuestionnairesByRoomId?: Array<{
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
  }> | null;
};

export type QuestionnairesChangedSubscriptionVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type QuestionnairesChangedSubscription = {
  __typename?: 'Subscription';
  questionnairesChanged: string;
};

export type QuestionnaireByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type QuestionnaireByIdQuery = {
  __typename?: 'Query';
  questionnaireById?: {
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    statisticsPublished?: boolean | null;
    correctOptionsPublished?: boolean | null;
    leaderboardEnabled?: boolean | null;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireContentsByQuestionnaireIdQueryVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type QuestionnaireContentsByQuestionnaireIdQuery = {
  __typename?: 'Query';
  questionnaireContentsByQuestionnaireId?: {
    __typename?: 'ContentConnection';
    edges?: Array<{
      __typename?: 'ContentEdge';
      node: {
        __typename?: 'Content';
        correctAnswerCount?: number | null;
        hasAnswers: boolean;
        id: string;
        body: string;
        bodyRendered?: string | null;
        duration?: number | null;
        abstentionsAllowed?: boolean | null;
        hasCorrectAnswer?: boolean | null;
        weight?: number | null;
        answerCount?: number | null;
        abstentionCount?: number | null;
        position?: number | null;
        activeRound?: {
          __typename?: 'Round';
          id: string;
          contentId?: string | null;
          roundNo: number;
          closed: boolean;
          started: boolean;
          answerable: boolean;
        } | null;
        formatData:
          | {
              __typename?: 'ChoiceContentFormatData';
              format: ContentType;
              correctOptionIndexes?: Array<number> | null;
              multiple?: boolean | null;
              options: Array<{
                __typename?: 'AnswerOption';
                label: string;
                labelRendered?: string | null;
              }>;
            }
          | { __typename?: 'ScaleContentFormatData'; format: ContentType }
          | { __typename?: 'TextContentFormatData'; format: ContentType }
          | {
              __typename?: 'WordcloudContentFormatData';
              format: ContentType;
              maxAnswers: number;
            };
      };
    } | null> | null;
  } | null;
};

export type QuestionnairePublishedContentsByQuestionnaireIdQueryVariables =
  Exact<{
    questionnaireId: Scalars['UUID']['input'];
  }>;

export type QuestionnairePublishedContentsByQuestionnaireIdQuery = {
  __typename?: 'Query';
  questionnairePublishedContentsByQuestionnaireId?: {
    __typename?: 'ContentConnection';
    edges?: Array<{
      __typename?: 'ContentEdge';
      node: {
        __typename?: 'Content';
        id: string;
        body: string;
        bodyRendered?: string | null;
        duration?: number | null;
        abstentionsAllowed?: boolean | null;
        hasCorrectAnswer?: boolean | null;
        weight?: number | null;
        answerCount?: number | null;
        abstentionCount?: number | null;
        position?: number | null;
        activeRound?: {
          __typename?: 'Round';
          id: string;
          contentId?: string | null;
          roundNo: number;
          closed: boolean;
          started: boolean;
          answerable: boolean;
        } | null;
        formatData:
          | {
              __typename?: 'ChoiceContentFormatData';
              format: ContentType;
              correctOptionIndexes?: Array<number> | null;
              multiple?: boolean | null;
              options: Array<{
                __typename?: 'AnswerOption';
                label: string;
                labelRendered?: string | null;
              }>;
            }
          | { __typename?: 'ScaleContentFormatData'; format: ContentType }
          | { __typename?: 'TextContentFormatData'; format: ContentType }
          | {
              __typename?: 'WordcloudContentFormatData';
              format: ContentType;
              maxAnswers: number;
            };
      };
    } | null> | null;
  } | null;
};

export type CreateQuestionnaireMutationVariables = Exact<{
  input: CreateQuestionnaireInput;
}>;

export type CreateQuestionnaireMutation = {
  __typename?: 'Mutation';
  createQuestionnaire: {
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    statisticsPublished?: boolean | null;
    correctOptionsPublished?: boolean | null;
    leaderboardEnabled?: boolean | null;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  };
};

export type ToggleQuestionnairePublishedMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  published: Scalars['Boolean']['input'];
}>;

export type ToggleQuestionnairePublishedMutation = {
  __typename?: 'Mutation';
  toggleQuestionnairePublished: {
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    statisticsPublished?: boolean | null;
    correctOptionsPublished?: boolean | null;
    leaderboardEnabled?: boolean | null;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  };
};

export type CreateQuestionnaireChoiceContentMutationVariables = Exact<{
  input: CreateChoiceContentInput;
}>;

export type CreateQuestionnaireChoiceContentMutation = {
  __typename?: 'Mutation';
  createQuestionnaireChoiceContent?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireChoiceContentMutationVariables = Exact<{
  input: UpdateChoiceContentInput;
}>;

export type UpdateQuestionnaireChoiceContentMutation = {
  __typename?: 'Mutation';
  updateQuestionnaireChoiceContent?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CreateQuestionnaireWordcloudContentMutationVariables = Exact<{
  input: CreateWordcloudContentInput;
}>;

export type CreateQuestionnaireWordcloudContentMutation = {
  __typename?: 'Mutation';
  createQuestionnaireWordcloudContent?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireWordcloudContentMutationVariables = Exact<{
  input: UpdateWordcloudContentInput;
}>;

export type UpdateQuestionnaireWordcloudContentMutation = {
  __typename?: 'Mutation';
  updateQuestionnaireWordcloudContent?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type QuestionnaireContentByIdQueryVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type QuestionnaireContentByIdQuery = {
  __typename?: 'Query';
  questionnaireContentById?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type QuestionnaireAnswerByRoundIdQueryVariables = Exact<{
  roundId: Scalars['UUID']['input'];
}>;

export type QuestionnaireAnswerByRoundIdQuery = {
  __typename?: 'Query';
  questionnaireAnswerByRoundId?: {
    __typename?: 'Answer';
    id: string;
    result: AnswerResultState;
    formatData?:
      | {
          __typename?: 'ChoiceAnswerFormatData';
          format: ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename?: 'WordcloudAnswerFormatData';
          format: ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type QuestionnaireContentAnswerResultsByQuestionnaireIdQueryVariables =
  Exact<{
    questionnaireId: Scalars['UUID']['input'];
  }>;

export type QuestionnaireContentAnswerResultsByQuestionnaireIdQuery = {
  __typename?: 'Query';
  questionnaireContentAnswerResultsByQuestionnaireId?: Array<{
    __typename?: 'ContentAnswerResult';
    contentId: string;
    result: AnswerResultState;
    durationMs?: number | null;
  }> | null;
};

export type QuestionnaireAnswerResultsByQuestionnaireIdQueryVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type QuestionnaireAnswerResultsByQuestionnaireIdQuery = {
  __typename?: 'Query';
  questionnaireAnswerResultsByQuestionnaireId?: {
    __typename?: 'QuestionnaireAnswerResult';
    correctAnswerCount?: number | null;
    scorableContentCount?: number | null;
    achievedScore?: number | null;
    maxScore?: number | null;
  } | null;
};

export type QuestionnaireChoiceRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: Scalars['UUID']['input'];
}>;

export type QuestionnaireChoiceRoundStatsByRoundIdQuery = {
  __typename?: 'Query';
  questionnaireChoiceRoundStatsByRoundId?: {
    __typename?: 'ChoiceContentRoundStats';
    selectionCounts?: Array<number> | null;
  } | null;
};

export type QuestionnaireWordcloudRoundStatsByRoundIdQueryVariables = Exact<{
  roundId: Scalars['UUID']['input'];
}>;

export type QuestionnaireWordcloudRoundStatsByRoundIdQuery = {
  __typename?: 'Query';
  questionnaireWordcloudRoundStatsByRoundId?: {
    __typename?: 'WordcloudContentRoundStats';
    words?: Array<string> | null;
    counts?: Array<number> | null;
  } | null;
};

export type CreateQuestionnaireChoiceAnswerMutationVariables = Exact<{
  input: CreateChoiceAnswerInput;
}>;

export type CreateQuestionnaireChoiceAnswerMutation = {
  __typename?: 'Mutation';
  createQuestionnaireChoiceAnswer?: {
    __typename?: 'Answer';
    id: string;
    result: AnswerResultState;
    formatData?:
      | {
          __typename?: 'ChoiceAnswerFormatData';
          format: ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename?: 'WordcloudAnswerFormatData';
          format: ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireWordcloudAnswerMutationVariables = Exact<{
  input: CreateWordcloudAnswerInput;
}>;

export type CreateQuestionnaireWordcloudAnswerMutation = {
  __typename?: 'Mutation';
  createQuestionnaireWordcloudAnswer?: {
    __typename?: 'Answer';
    id: string;
    result: AnswerResultState;
    formatData?:
      | {
          __typename?: 'ChoiceAnswerFormatData';
          format: ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename?: 'WordcloudAnswerFormatData';
          format: ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type CreateQuestionnaireAbstentionMutationVariables = Exact<{
  roundId: Scalars['UUID']['input'];
}>;

export type CreateQuestionnaireAbstentionMutation = {
  __typename?: 'Mutation';
  createQuestionnaireAbstention?: {
    __typename?: 'Answer';
    id: string;
    result: AnswerResultState;
    formatData?:
      | {
          __typename?: 'ChoiceAnswerFormatData';
          format: ContentType;
          selectedChoiceIndexes: Array<number>;
        }
      | {
          __typename?: 'WordcloudAnswerFormatData';
          format: ContentType;
          words: Array<string>;
        }
      | null;
  } | null;
};

export type DeleteQuestionnaireContentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteQuestionnaireContentMutation = {
  __typename?: 'Mutation';
  deleteQuestionnaireContent?: string | null;
};

export type DeleteQuestionnaireMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteQuestionnaireMutation = {
  __typename?: 'Mutation';
  deleteQuestionnaire?: string | null;
};

export type DeleteQuestionnaireAnswersByContentIdMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
}>;

export type DeleteQuestionnaireAnswersByContentIdMutation = {
  __typename?: 'Mutation';
  deleteQuestionnaireAnswersByContentId?: boolean | null;
};

export type BanQuestionnaireWordcloudContentKeywordMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
  keyword: Scalars['String']['input'];
}>;

export type BanQuestionnaireWordcloudContentKeywordMutation = {
  __typename?: 'Mutation';
  banQuestionnaireWordcloudContentKeyword?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ResetBannedQuestionnaireWordcloudContentKeywordsMutationVariables =
  Exact<{
    contentId: Scalars['UUID']['input'];
  }>;

export type ResetBannedQuestionnaireWordcloudContentKeywordsMutation = {
  __typename?: 'Mutation';
  resetBannedQuestionnaireWordcloudContentKeywords?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type ResetQuestionnaireResultsMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;

export type ResetQuestionnaireResultsMutation = {
  __typename?: 'Mutation';
  resetQuestionnaireResults?: boolean | null;
};

export type UpdateQuestionnaireMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  publishingMode?: InputMaybe<QuestionnairePublishingMode>;
  statisticsPublished?: InputMaybe<Scalars['Boolean']['input']>;
  correctOptionsPublished?: InputMaybe<Scalars['Boolean']['input']>;
  leaderboardEnabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type UpdateQuestionnaireMutation = {
  __typename?: 'Mutation';
  updateQuestionnaire: {
    __typename?: 'Questionnaire';
    id: string;
    name: string;
    type: QuestionnaireType;
    published: boolean;
    publishingMode: QuestionnairePublishingMode;
    statisticsPublished?: boolean | null;
    correctOptionsPublished?: boolean | null;
    leaderboardEnabled?: boolean | null;
    contentCount?: number | null;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  };
};

export type DuplicateQuestionnaireContentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DuplicateQuestionnaireContentMutation = {
  __typename?: 'Mutation';
  duplicateQuestionnaireContent?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type CopyQuestionnaireContentToQuestionnaireMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
  questionnaireId: Scalars['UUID']['input'];
}>;

export type CopyQuestionnaireContentToQuestionnaireMutation = {
  __typename?: 'Mutation';
  copyQuestionnaireContentToQuestionnaire?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type MoveQuestionnaireContentToQuestionnaireMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
  questionnaireId: Scalars['UUID']['input'];
}>;

export type MoveQuestionnaireContentToQuestionnaireMutation = {
  __typename?: 'Mutation';
  moveQuestionnaireContentToQuestionnaire?: {
    __typename?: 'Content';
    correctAnswerCount?: number | null;
    hasAnswers: boolean;
    id: string;
    body: string;
    bodyRendered?: string | null;
    duration?: number | null;
    abstentionsAllowed?: boolean | null;
    hasCorrectAnswer?: boolean | null;
    weight?: number | null;
    answerCount?: number | null;
    abstentionCount?: number | null;
    position?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
    formatData:
      | {
          __typename?: 'ChoiceContentFormatData';
          format: ContentType;
          correctOptionIndexes?: Array<number> | null;
          multiple?: boolean | null;
          options: Array<{
            __typename?: 'AnswerOption';
            label: string;
            labelRendered?: string | null;
          }>;
        }
      | { __typename?: 'ScaleContentFormatData'; format: ContentType }
      | { __typename?: 'TextContentFormatData'; format: ContentType }
      | {
          __typename?: 'WordcloudContentFormatData';
          format: ContentType;
          maxAnswers: number;
        };
  } | null;
};

export type UpdateQuestionnaireContentOrderMutationVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
  contentIds: Array<Scalars['UUID']['input']> | Scalars['UUID']['input'];
}>;

export type UpdateQuestionnaireContentOrderMutation = {
  __typename?: 'Mutation';
  updateQuestionnaireContentOrder?: {
    __typename?: 'Questionnaire';
    id: string;
  } | null;
};

export type QuestionnaireUpdatedSubscriptionVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type QuestionnaireUpdatedSubscription = {
  __typename?: 'Subscription';
  questionnaireUpdated?: {
    __typename?: 'Questionnaire';
    id: string;
    publishingMode: QuestionnairePublishingMode;
    publishedUpToContent?: {
      __typename?: 'Content';
      id: string;
      position?: number | null;
    } | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireContentUpdatedSubscriptionVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type QuestionnaireContentUpdatedSubscription = {
  __typename?: 'Subscription';
  questionnaireContentUpdated?: {
    __typename?: 'Content';
    id: string;
    answerCount?: number | null;
    abstentionCount?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  } | null;
};

export type CreatorQuestionnaireContentUpdatedSubscriptionVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type CreatorQuestionnaireContentUpdatedSubscription = {
  __typename?: 'Subscription';
  questionnaireContentUpdated?: {
    __typename?: 'Content';
    id: string;
    answerCount?: number | null;
    abstentionCount?: number | null;
    correctAnswerCount?: number | null;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  } | null;
};

export type QuestionnaireChoiceRoundStatsUpdatedSubscriptionVariables = Exact<{
  roundId: Scalars['UUID']['input'];
}>;

export type QuestionnaireChoiceRoundStatsUpdatedSubscription = {
  __typename?: 'Subscription';
  questionnaireChoiceRoundStatsUpdated?: {
    __typename?: 'ChoiceContentRoundStats';
    selectionCounts?: Array<number> | null;
  } | null;
};

export type QuestionnaireWordcloudRoundStatsUpdatedSubscriptionVariables =
  Exact<{
    roundId: Scalars['UUID']['input'];
  }>;

export type QuestionnaireWordcloudRoundStatsUpdatedSubscription = {
  __typename?: 'Subscription';
  questionnaireWordcloudRoundStatsUpdated?: {
    __typename?: 'WordcloudContentRoundStats';
    words?: Array<string> | null;
    counts?: Array<number> | null;
  } | null;
};

export type StartQuestionnaireContentMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
}>;

export type StartQuestionnaireContentMutation = {
  __typename?: 'Mutation';
  startQuestionnaireContent: {
    __typename?: 'Questionnaire';
    id: string;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  };
};

export type StartQuestionnaireContentRoundMutationVariables = Exact<{
  contentId: Scalars['UUID']['input'];
}>;

export type StartQuestionnaireContentRoundMutation = {
  __typename?: 'Mutation';
  startQuestionnaireContentRound: {
    __typename?: 'Round';
    id: string;
    contentId?: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answerable: boolean;
  };
};

export type StopQuestionnaireContentMutationVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
}>;

export type StopQuestionnaireContentMutation = {
  __typename?: 'Mutation';
  stopQuestionnaireContent: {
    __typename?: 'Questionnaire';
    id: string;
    activeRound?: {
      __typename?: 'Round';
      id: string;
      contentId?: string | null;
      roundNo: number;
      closed: boolean;
      started: boolean;
      answerable: boolean;
    } | null;
  };
};

export type QuestionnaireRoundsByContentIdQueryVariables = Exact<{
  contentId: Scalars['UUID']['input'];
}>;

export type QuestionnaireRoundsByContentIdQuery = {
  __typename?: 'Query';
  questionnaireRoundsByContentId?: Array<{
    __typename?: 'Round';
    id: string;
    contentId?: string | null;
    roundNo: number;
    closed: boolean;
    started: boolean;
    answerable: boolean;
  }> | null;
};

export type PublishQuestionnaireUpToContentMutationVariables = Exact<{
  questionnaireId: Scalars['UUID']['input'];
  contentId: Scalars['UUID']['input'];
}>;

export type PublishQuestionnaireUpToContentMutation = {
  __typename?: 'Mutation';
  publishQuestionnaireUpToContent: {
    __typename?: 'Questionnaire';
    id: string;
    publishedUpToContent?: { __typename?: 'Content'; id: string } | null;
  };
};

export type RoomDetailsFragmentFragment = {
  __typename?: 'Room';
  id: string;
  shortId: string;
  name: string;
  description?: string | null;
  descriptionRendered?: string | null;
  language?: string | null;
  focusModeEnabled?: boolean | null;
};

export type RoomStatsFragment = {
  __typename?: 'RoomStats';
  id: string;
  activeMemberCount?: number | null;
};

export type RoomMembershipFragment = {
  __typename?: 'RoomMembership';
  role: RoomRole;
  room: {
    __typename?: 'Room';
    id: string;
    shortId: string;
    name: string;
    description?: string | null;
    descriptionRendered?: string | null;
    language?: string | null;
    focusModeEnabled?: boolean | null;
    stats?: {
      __typename?: 'RoomStats';
      id: string;
      activeMemberCount?: number | null;
    } | null;
  };
};

export type RoomMemberFragment = {
  __typename?: 'RoomMember';
  role?: RoomRole | null;
  user: {
    __typename?: 'User';
    id: string;
    displayId?: string | null;
    displayName?: string | null;
    verified: boolean;
  };
};

export type RoomIdByShortIdQueryVariables = Exact<{
  shortId: Scalars['String']['input'];
}>;

export type RoomIdByShortIdQuery = {
  __typename?: 'Query';
  roomByShortId?: { __typename?: 'Room'; id: string } | null;
};

export type RoomLanguageByShortIdQueryVariables = Exact<{
  shortId: Scalars['String']['input'];
}>;

export type RoomLanguageByShortIdQuery = {
  __typename?: 'Query';
  roomByShortId?: { __typename?: 'Room'; language?: string | null } | null;
};

export type RoomByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RoomByIdQuery = {
  __typename?: 'Query';
  roomById?: {
    __typename?: 'Room';
    id: string;
    shortId: string;
    name: string;
    description?: string | null;
    descriptionRendered?: string | null;
    language?: string | null;
    focusModeEnabled?: boolean | null;
  } | null;
};

export type RoomFocusModeEnabledByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RoomFocusModeEnabledByIdQuery = {
  __typename?: 'Query';
  roomById?: { __typename?: 'Room'; focusModeEnabled?: boolean | null } | null;
};

export type RoomByShortIdQueryVariables = Exact<{
  shortId: Scalars['String']['input'];
}>;

export type RoomByShortIdQuery = {
  __typename?: 'Query';
  roomByShortId?: {
    __typename?: 'Room';
    id: string;
    shortId: string;
    name: string;
    description?: string | null;
    descriptionRendered?: string | null;
    language?: string | null;
    focusModeEnabled?: boolean | null;
  } | null;
};

export type RoomsQueryVariables = Exact<{
  room: RoomQueryInput;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type RoomsQuery = {
  __typename?: 'Query';
  rooms?: {
    __typename?: 'RoomConnection';
    edges?: Array<{
      __typename?: 'RoomEdge';
      cursor: string;
      node: {
        __typename?: 'Room';
        id: string;
        shortId: string;
        name: string;
        description?: string | null;
        descriptionRendered?: string | null;
        language?: string | null;
        focusModeEnabled?: boolean | null;
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type RoomMembershipByIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type RoomMembershipByIdQuery = {
  __typename?: 'Query';
  roomMembershipById?: {
    __typename?: 'RoomMembership';
    role: RoomRole;
    room: {
      __typename?: 'Room';
      id: string;
      shortId: string;
      name: string;
      description?: string | null;
      descriptionRendered?: string | null;
      language?: string | null;
      focusModeEnabled?: boolean | null;
      stats?: {
        __typename?: 'RoomStats';
        id: string;
        activeMemberCount?: number | null;
      } | null;
    };
  } | null;
};

export type RoomMembershipByShortIdQueryVariables = Exact<{
  shortId: Scalars['String']['input'];
}>;

export type RoomMembershipByShortIdQuery = {
  __typename?: 'Query';
  roomMembershipByShortId?: {
    __typename?: 'RoomMembership';
    role: RoomRole;
    room: {
      __typename?: 'Room';
      id: string;
      shortId: string;
      name: string;
      description?: string | null;
      descriptionRendered?: string | null;
      language?: string | null;
      focusModeEnabled?: boolean | null;
      stats?: {
        __typename?: 'RoomStats';
        id: string;
        activeMemberCount?: number | null;
      } | null;
    };
  } | null;
};

export type RoomMembershipsQueryVariables = Exact<{
  query?: InputMaybe<RoomQueryInput>;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type RoomMembershipsQuery = {
  __typename?: 'Query';
  roomMemberships?: {
    __typename?: 'RoomMembershipConnection';
    edges?: Array<{
      __typename?: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename?: 'RoomMembership';
        role: RoomRole;
        room: {
          __typename?: 'Room';
          id: string;
          shortId: string;
          name: string;
          description?: string | null;
          descriptionRendered?: string | null;
          language?: string | null;
          focusModeEnabled?: boolean | null;
          stats?: {
            __typename?: 'RoomStats';
            id: string;
            activeMemberCount?: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type RoomsByUserIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type RoomsByUserIdQuery = {
  __typename?: 'Query';
  roomsByUserId?: {
    __typename?: 'RoomMembershipConnection';
    edges?: Array<{
      __typename?: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename?: 'RoomMembership';
        role: RoomRole;
        room: {
          __typename?: 'Room';
          id: string;
          shortId: string;
          name: string;
          description?: string | null;
          descriptionRendered?: string | null;
          language?: string | null;
          focusModeEnabled?: boolean | null;
          stats?: {
            __typename?: 'RoomStats';
            id: string;
            activeMemberCount?: number | null;
          } | null;
        };
      };
    } | null> | null;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export type RoomStatsByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RoomStatsByIdQuery = {
  __typename?: 'Query';
  roomById?: {
    __typename?: 'Room';
    stats?: {
      __typename?: 'RoomStats';
      id: string;
      activeMemberCount?: number | null;
    } | null;
  } | null;
};

export type JoinRoomMutationVariables = Exact<{
  shortId: Scalars['ID']['input'];
}>;

export type JoinRoomMutation = {
  __typename?: 'Mutation';
  joinRoom: {
    __typename?: 'RoomMembership';
    role: RoomRole;
    room: {
      __typename?: 'Room';
      id: string;
      shortId: string;
      name: string;
      description?: string | null;
      descriptionRendered?: string | null;
      language?: string | null;
      focusModeEnabled?: boolean | null;
      stats?: {
        __typename?: 'RoomStats';
        id: string;
        activeMemberCount?: number | null;
      } | null;
    };
  };
};

export type CreateRoomMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;

export type CreateRoomMutation = {
  __typename?: 'Mutation';
  createRoom: { __typename?: 'Room'; id: string; shortId: string };
};

export type DeleteRoomMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteRoomMutation = {
  __typename?: 'Mutation';
  deleteRoom: string;
};

export type DuplicateRoomMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
}>;

export type DuplicateRoomMutation = {
  __typename?: 'Mutation';
  duplicateRoom: { __typename?: 'Room'; id: string; shortId: string };
};

export type DuplicateDemoRoomMutationVariables = Exact<{
  [key: string]: never;
}>;

export type DuplicateDemoRoomMutation = {
  __typename?: 'Mutation';
  duplicateDemoRoom: { __typename?: 'Room'; id: string; shortId: string };
};

export type UpdateRoomDetailsMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  description: Scalars['String']['input'];
  languageCode?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateRoomDetailsMutation = {
  __typename?: 'Mutation';
  updateRoomName: { __typename?: 'Room'; id: string; name: string };
  updateRoomDescription: {
    __typename?: 'Room';
    id: string;
    description?: string | null;
    descriptionRendered?: string | null;
  };
  updateRoomLanguage: {
    __typename?: 'Room';
    id: string;
    language?: string | null;
  };
};

export type UpdateRoomLanguageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  languageCode: Scalars['String']['input'];
}>;

export type UpdateRoomLanguageMutation = {
  __typename?: 'Mutation';
  updateRoomLanguage: {
    __typename?: 'Room';
    id: string;
    language?: string | null;
  };
};

export type UpdateRoomFocusModeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  enabled: Scalars['Boolean']['input'];
}>;

export type UpdateRoomFocusModeMutation = {
  __typename?: 'Mutation';
  updateRoomFocusMode: {
    __typename?: 'Room';
    id: string;
    focusModeEnabled?: boolean | null;
  };
};

export type RoomManagingMembersByRoomIdQueryVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type RoomManagingMembersByRoomIdQuery = {
  __typename?: 'Query';
  roomManagingMembersByRoomId?: Array<{
    __typename?: 'RoomMember';
    role?: RoomRole | null;
    user: {
      __typename?: 'User';
      id: string;
      displayId?: string | null;
      displayName?: string | null;
      verified: boolean;
    };
  }> | null;
};

export type GrantRoomRoleMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
  role: RoomRole;
}>;

export type GrantRoomRoleMutation = {
  __typename?: 'Mutation';
  grantRoomRole: {
    __typename?: 'RoomMember';
    role?: RoomRole | null;
    room: { __typename?: 'Room'; id: string };
    user: { __typename?: 'User'; id: string };
  };
};

export type GrantRoomRoleByInvitationMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
  mailAddress: Scalars['String']['input'];
  role: RoomRole;
}>;

export type GrantRoomRoleByInvitationMutation = {
  __typename?: 'Mutation';
  grantRoomRoleByInvitation: {
    __typename?: 'RoomMember';
    role?: RoomRole | null;
    room: { __typename?: 'Room'; id: string };
    user: { __typename?: 'User'; id: string };
  };
};

export type RevokeRoomRoleMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
}>;

export type RevokeRoomRoleMutation = {
  __typename?: 'Mutation';
  revokeRoomRole: {
    __typename?: 'RoomMember';
    room: { __typename?: 'Room'; id: string };
    user: { __typename?: 'User'; id: string };
  };
};

export type RevokeRoomMembershipMutationVariables = Exact<{
  roomId: Scalars['UUID']['input'];
}>;

export type RevokeRoomMembershipMutation = {
  __typename?: 'Mutation';
  revokeRoomMembership: {
    __typename?: 'RoomMembership';
    room: { __typename?: 'Room'; id: string };
  };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  __typename?: 'Query';
  currentUser?: {
    __typename?: 'User';
    id: string;
    verified: boolean;
    displayId?: string | null;
    displayName?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
  } | null;
};

export type UserByDisplayIdQueryVariables = Exact<{
  displayId: Scalars['ID']['input'];
}>;

export type UserByDisplayIdQuery = {
  __typename?: 'Query';
  userByDisplayId?: {
    __typename?: 'User';
    id: string;
    verified: boolean;
    displayId?: string | null;
    displayName?: string | null;
  } | null;
};

export type CurrentUserWithSettingsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type CurrentUserWithSettingsQuery = {
  __typename?: 'Query';
  currentUser?: {
    __typename?: 'User';
    id: string;
    verified: boolean;
    displayId?: string | null;
    displayName?: string | null;
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    localPasswordSet?: boolean | null;
    uiSettings?: {
      __typename?: 'UserUiSettings';
      contentAnswersDirectlyBelowChart?: boolean | null;
      contentVisualizationUnitPercent?: boolean | null;
      showContentResultsDirectly?: boolean | null;
      rotateWordcloudItems?: boolean | null;
    } | null;
  } | null;
};

export type ClaimUnverifiedUserMutationVariables = Exact<{
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type ClaimUnverifiedUserMutation = {
  __typename?: 'Mutation';
  claimUnverifiedUser?: {
    __typename?: 'User';
    id: string;
    displayId?: string | null;
    unverifiedMailAddress?: string | null;
  } | null;
};

export type VerifyUserMailAddressMutationVariables = Exact<{
  verificationCode: Scalars['String']['input'];
}>;

export type VerifyUserMailAddressMutation = {
  __typename?: 'Mutation';
  verifyUserMailAddress?: {
    __typename?: 'User';
    id: string;
    displayId?: string | null;
    unverifiedMailAddress?: string | null;
  } | null;
};

export type VerifyUserMailAddressUnauthenticatedMutationVariables = Exact<{
  verificationCode: Scalars['String']['input'];
  userId: Scalars['UUID']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
}>;

export type VerifyUserMailAddressUnauthenticatedMutation = {
  __typename?: 'Mutation';
  verifyUserMailAddressUnauthenticated?: {
    __typename?: 'User';
    id: string;
    displayId?: string | null;
    unverifiedMailAddress?: string | null;
  } | null;
};

export type DeleteUserMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteUserMutation = {
  __typename?: 'Mutation';
  deleteUser?: string | null;
};

export type UpdateUserSettingsMutationVariables = Exact<{
  contentAnswersDirectlyBelowChart?: InputMaybe<Scalars['Boolean']['input']>;
  contentVisualizationUnitPercent?: InputMaybe<Scalars['Boolean']['input']>;
  showContentResultsDirectly?: InputMaybe<Scalars['Boolean']['input']>;
  rotateWordcloudItems?: InputMaybe<Scalars['Boolean']['input']>;
}>;

export type UpdateUserSettingsMutation = {
  __typename?: 'Mutation';
  updateUserUiSettings?: {
    __typename?: 'UserUiSettings';
    contentAnswersDirectlyBelowChart?: boolean | null;
    contentVisualizationUnitPercent?: boolean | null;
    showContentResultsDirectly?: boolean | null;
    rotateWordcloudItems?: boolean | null;
  } | null;
};

export type RequestUserPasswordResetMutationVariables = Exact<{
  mailAddress: Scalars['String']['input'];
}>;

export type RequestUserPasswordResetMutation = {
  __typename?: 'Mutation';
  requestUserPasswordReset?: boolean | null;
};

export type RequestUserPasswordSetupMutationVariables = Exact<{
  [key: string]: never;
}>;

export type RequestUserPasswordSetupMutation = {
  __typename?: 'Mutation';
  requestUserPasswordSetup?: boolean | null;
};

export type ResetUserPasswordMutationVariables = Exact<{
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
}>;

export type ResetUserPasswordMutation = {
  __typename?: 'Mutation';
  resetUserPassword?: { __typename?: 'User'; id: string } | null;
};

export type UpdateUserLanguageMutationVariables = Exact<{
  languageCode: Scalars['String']['input'];
}>;

export type UpdateUserLanguageMutation = {
  __typename?: 'Mutation';
  updateUserLanguage?: {
    __typename?: 'User';
    id: string;
    language?: string | null;
  } | null;
};

export type ResendVerificationMailMutationVariables = Exact<{
  [key: string]: never;
}>;

export type ResendVerificationMailMutation = {
  __typename?: 'Mutation';
  resendVerificationMail?: boolean | null;
};

export type UpdateUserMailAddressMutationVariables = Exact<{
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type UpdateUserMailAddressMutation = {
  __typename?: 'Mutation';
  updateUserMailAddress?: {
    __typename?: 'User';
    id: string;
    unverifiedMailAddress?: string | null;
  } | null;
};

export type UpdateUserPasswordMutationVariables = Exact<{
  oldPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type UpdateUserPasswordMutation = {
  __typename?: 'Mutation';
  updateUserPassword?: { __typename?: 'User'; id: string } | null;
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
      ... on ChoiceContentFormatData {
        format
        options {
          label
          labelRendered
        }
        correctOptionIndexes
        multiple
      }
      ... on ScaleContentFormatData {
        format
      }
      ... on TextContentFormatData {
        format
      }
      ... on WordcloudContentFormatData {
        format
        maxAnswers
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
    formatData {
      ... on ChoiceAnswerFormatData {
        format
        selectedChoiceIndexes
      }
      ... on WordcloudAnswerFormatData {
        format
        words
      }
    }
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
export const ChoiceContentRoundStatsFragmentDoc = gql`
  fragment ChoiceContentRoundStats on ChoiceContentRoundStats {
    selectionCounts
  }
`;
export const WordcloudContentRoundStatsFragmentDoc = gql`
  fragment WordcloudContentRoundStats on WordcloudContentRoundStats {
    words
    counts
  }
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
