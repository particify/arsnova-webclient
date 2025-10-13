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
  /** A slightly refined version of RFC-3339 compliant DateTime Scalar */
  DateTime: { input: string; output: string };
  /** A universally unique identifier compliant UUID Scalar */
  UUID: { input: string; output: string };
};

export type AdminAnnouncementStats = {
  __typename?: 'AdminAnnouncementStats';
  totalCount: Scalars['Int']['output'];
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

export type AdminRoomQueryInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  shortId?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminRoomStats = {
  __typename?: 'AdminRoomStats';
  totalCount: Scalars['Int']['output'];
};

export type AdminUser = {
  __typename?: 'AdminUser';
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  mailAddress?: Maybe<Scalars['String']['output']>;
  uiSettings?: Maybe<UserUiSettings>;
  unverifiedMailAddress?: Maybe<Scalars['String']['output']>;
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

export type CreatePostInput = {
  body: Scalars['String']['input'];
  qnaId: Scalars['UUID']['input'];
  tagIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type CreateQnaInput = {
  roomId: Scalars['UUID']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
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

export type DuplicateRoomInput = {
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
};

export type JoinRoomInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  shortId?: InputMaybe<Scalars['ID']['input']>;
};

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
  claimUnverifiedUser?: Maybe<User>;
  createAnnouncement: Announcement;
  createQnaPost: Post;
  createQnaReply: Reply;
  createQnaTag: Tag;
  createRoom: Room;
  deleteAnnouncement: Scalars['ID']['output'];
  deleteQnaPost: Scalars['ID']['output'];
  deleteQnaPostsByQnaId: Scalars['Int']['output'];
  deleteQnaReply: Scalars['ID']['output'];
  deleteQnaTag: Scalars['ID']['output'];
  deleteRoom: Scalars['UUID']['output'];
  deleteUser?: Maybe<Scalars['UUID']['output']>;
  duplicateDemoRoom: Room;
  duplicateRoom: Room;
  grantRoomRole: RoomMember;
  grantRoomRoleByInvitation: RoomMember;
  joinRoom: RoomMembership;
  pauseQna: Qna;
  rejectQnaPost: Post;
  requestUserPasswordReset?: Maybe<Scalars['Boolean']['output']>;
  resendVerificationMail?: Maybe<Scalars['Boolean']['output']>;
  resetUserPassword?: Maybe<User>;
  revokeRoomMembership: RoomMembership;
  revokeRoomRole: RoomMember;
  startQna: Qna;
  stopQna: Qna;
  updateAnnouncement: Announcement;
  updateQnaActivePostId: Qna;
  updateQnaAutoPublish: Qna;
  updateQnaPostCorrect: Post;
  updateQnaPostFavorite: Post;
  updateQnaReply: Reply;
  updateQnaThreshold: Qna;
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

export type MutationClaimUnverifiedUserArgs = {
  mailAddress: Scalars['String']['input'];
  password: Scalars['String']['input'];
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

export type MutationDeleteRoomArgs = {
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

export type MutationPauseQnaArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRejectQnaPostArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRequestUserPasswordResetArgs = {
  mailAddress: Scalars['String']['input'];
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

export type MutationStopQnaArgs = {
  id: Scalars['ID']['input'];
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
  input: UpdateReplyInput;
};

export type MutationUpdateQnaThresholdArgs = {
  id: Scalars['ID']['input'];
  threshold?: InputMaybe<Scalars['Int']['input']>;
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
  adminAnnouncementStats?: Maybe<AdminAnnouncementStats>;
  adminMembershipsByUserId?: Maybe<RoomMembershipConnection>;
  adminRoomByIdOrShortId?: Maybe<AdminRoom>;
  adminRoomStats?: Maybe<AdminRoomStats>;
  adminUserById?: Maybe<AdminUser>;
  adminUserStats?: Maybe<AdminUserStats>;
  adminUsers?: Maybe<AdminUserConnection>;
  announcementsByRoomId?: Maybe<AnnouncementConnection>;
  announcementsByUserId?: Maybe<AnnouncementConnection>;
  announcementsForCurrentUser?: Maybe<AnnouncementConnection>;
  announcementsMetaForCurrentUser?: Maybe<AnnouncementsMeta>;
  currentUser?: Maybe<User>;
  qnaPostCountsByQnaId?: Maybe<PostCountSummary>;
  qnaPostsByQnaId?: Maybe<PostConnection>;
  qnasByRoomId?: Maybe<QnaConnection>;
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

export type QueryAdminMembershipsByUserIdArgs = {
  userId: Scalars['UUID']['input'];
};

export type QueryAdminRoomByIdOrShortIdArgs = {
  input: AdminRoomQueryInput;
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
  id?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<RoomRole>;
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

export type Tag = {
  __typename?: 'Tag';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UpdateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReplyInput = {
  body: Scalars['String']['input'];
  postId: Scalars['UUID']['input'];
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

export type User = {
  __typename?: 'User';
  displayId?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
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

export type AdminUserDetailsFragment = {
  __typename?: 'AdminUser';
  id: string;
  username?: string | null;
  mailAddress?: string | null;
  unverifiedMailAddress?: string | null;
  language?: string | null;
  verificationCode?: number | null;
  verificationErrors?: number | null;
  verificationExpiresAt?: string | null;
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
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
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
        mailAddress?: string | null;
        unverifiedMailAddress?: string | null;
        language?: string | null;
        verificationCode?: number | null;
        verificationErrors?: number | null;
        verificationExpiresAt?: string | null;
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
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
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
    mailAddress?: string | null;
    unverifiedMailAddress?: string | null;
    language?: string | null;
    verificationCode?: number | null;
    verificationErrors?: number | null;
    verificationExpiresAt?: string | null;
    uiSettings?: {
      __typename?: 'UserUiSettings';
      contentAnswersDirectlyBelowChart?: boolean | null;
      contentVisualizationUnitPercent?: boolean | null;
      showContentResultsDirectly?: boolean | null;
      rotateWordcloudItems?: boolean | null;
    } | null;
  };
};

export type AdminRoomQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  shortId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type AdminRoomQuery = {
  __typename?: 'Query';
  adminRoomByIdOrShortId?: {
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
  adminRoomStats?: { __typename?: 'AdminRoomStats'; totalCount: number } | null;
  adminAnnouncementStats?: {
    __typename?: 'AdminAnnouncementStats';
    totalCount: number;
  } | null;
};

export type AdminMembershipsByUserIdQueryVariables = Exact<{
  userId: Scalars['UUID']['input'];
}>;

export type AdminMembershipsByUserIdQuery = {
  __typename?: 'Query';
  adminMembershipsByUserId?: {
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
  postId: Scalars['UUID']['input'];
  body: Scalars['String']['input'];
}>;

export type UpdateQnaReplyMutation = {
  __typename?: 'Mutation';
  updateQnaReply: { __typename?: 'Reply'; id: string; body: string };
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
      first: 10
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
export const AdminRoomDocument = gql`
  query AdminRoom($id: ID, $shortId: Int) {
    adminRoomByIdOrShortId(input: { id: $id, shortId: $shortId }) {
      ...AdminRoomDetails
    }
  }
  ${AdminRoomDetailsFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class AdminRoomGql extends Apollo.Query<
  AdminRoomQuery,
  AdminRoomQueryVariables
> {
  document = AdminRoomDocument;

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
    }
    adminAnnouncementStats {
      totalCount
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
export const AdminMembershipsByUserIdDocument = gql`
  query AdminMembershipsByUserId($userId: UUID!) {
    adminMembershipsByUserId(userId: $userId) {
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
export class AdminMembershipsByUserIdGql extends Apollo.Query<
  AdminMembershipsByUserIdQuery,
  AdminMembershipsByUserIdQueryVariables
> {
  document = AdminMembershipsByUserIdDocument;

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
  mutation UpdateQnaReply($postId: UUID!, $body: String!) {
    updateQnaReply(input: { postId: $postId, body: $body }) {
      id
      body
    }
  }
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
