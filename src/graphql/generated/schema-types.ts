export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  | BinaryAnswerFormatData
  | ChoiceAnswerFormatData
  | NumericAnswerFormatData
  | PrioritizationAnswerFormatData
  | ScaleAnswerFormatData
  | ShortAnswerAnswerFormatData
  | SortAnswerFormatData
  | TextAnswerFormatData
  | WordcloudAnswerFormatData;

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

export type BinaryAnswerFormatData = {
  __typename?: 'BinaryAnswerFormatData';
  answer: Scalars['Boolean']['output'];
  format: ContentType;
};

export type BinaryContentFormatData = {
  __typename?: 'BinaryContentFormatData';
  correctAnswer?: Maybe<Scalars['Boolean']['output']>;
  format: ContentType;
};

export type BinaryContentRoundStats = {
  __typename?: 'BinaryContentRoundStats';
  selectionCounts?: Maybe<Array<Scalars['Int']['output']>>;
};

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
  | BinaryContentFormatData
  | ChoiceContentFormatData
  | FlashcardContentFormatData
  | NumericContentFormatData
  | PrioritizationContentFormatData
  | ScaleContentFormatData
  | ShortAnswerContentFormatData
  | SlideContentFormatData
  | SortContentFormatData
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

export type CreateBinaryAnswerInput = {
  answer: Scalars['Boolean']['input'];
  roundId: Scalars['UUID']['input'];
};

export type CreateBinaryContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctAnswer?: InputMaybe<Scalars['Boolean']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  questionnaireId: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
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

export type CreateFlashcardContentInput = {
  answer: Scalars['String']['input'];
  body: Scalars['String']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type CreateNumericAnswerInput = {
  roundId: Scalars['UUID']['input'];
  selectedNumber: Scalars['Float']['input'];
};

export type CreateNumericContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctNumber?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  maxNumber: Scalars['Float']['input'];
  minNumber: Scalars['Float']['input'];
  questionnaireId: Scalars['UUID']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type CreatePostInput = {
  body: Scalars['String']['input'];
  qnaId: Scalars['UUID']['input'];
  tagIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type CreatePrioritizationAnswerInput = {
  assignedPoints: Array<Scalars['Int']['input']>;
  roundId: Scalars['UUID']['input'];
};

export type CreatePrioritizationContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  options: Array<Scalars['String']['input']>;
  questionnaireId: Scalars['UUID']['input'];
};

export type CreateQnaInput = {
  roomId: Scalars['UUID']['input'];
  topic?: InputMaybe<Scalars['String']['input']>;
};

export type CreateQuestionnaireFromTemplateInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['UUID']['input'];
  templateId: Scalars['UUID']['input'];
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

export type CreateScaleAnswerInput = {
  rating: Scalars['Int']['input'];
  roundId: Scalars['UUID']['input'];
};

export type CreateScaleContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  neutralOption: Scalars['Boolean']['input'];
  questionnaireId: Scalars['UUID']['input'];
  template: ScaleContentTemplate;
};

export type CreateShortAnswerAnswerInput = {
  body: Scalars['String']['input'];
  roundId: Scalars['UUID']['input'];
};

export type CreateShortAnswerContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctTerms: Array<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  questionnaireId: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateSlideContentInput = {
  body: Scalars['String']['input'];
  questionnaireId: Scalars['UUID']['input'];
};

export type CreateSortAnswerInput = {
  roundId: Scalars['UUID']['input'];
  selectedChoiceIndexes: Array<Scalars['Int']['input']>;
};

export type CreateSortContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  options: Array<Scalars['String']['input']>;
  questionnaireId: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateTagInput = {
  name: Scalars['String']['input'];
  qnaId: Scalars['UUID']['input'];
};

export type CreateTemplateFromQuestionnaireInput = {
  aiGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  attribution?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  language: Scalars['String']['input'];
  licenseId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  published?: InputMaybe<Scalars['Boolean']['input']>;
  questionnaireId: Scalars['UUID']['input'];
  tagNames?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateTextAnswerInput = {
  body: Scalars['String']['input'];
  roundId: Scalars['UUID']['input'];
};

export type CreateTextContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  questionnaireId: Scalars['UUID']['input'];
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

export type FlashcardContentFormatData = {
  __typename?: 'FlashcardContentFormatData';
  answer: Scalars['String']['output'];
  answerRendered?: Maybe<Scalars['String']['output']>;
  format: ContentType;
};

export type JoinRoomInput =
  | { id: Scalars['ID']['input']; shortId?: never }
  | { id?: never; shortId: Scalars['ID']['input'] };

export type LeaderboardCurrentResult = {
  __typename?: 'LeaderboardCurrentResult';
  correct: Scalars['Boolean']['output'];
  durationMs: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
};

export type LeaderboardEntry = {
  __typename?: 'LeaderboardEntry';
  currentResult?: Maybe<LeaderboardCurrentResult>;
  /** Equal scores share a position; the next distinct score continues after all of them. */
  position: Scalars['Int']['output'];
  score: Scalars['Int']['output'];
  userAlias?: Maybe<RoomUserAlias>;
};

export type LeaderboardPage = {
  __typename?: 'LeaderboardPage';
  entries: Array<LeaderboardEntry>;
  /** The requesting user's own entry, set only if it is not part of the entries above. */
  ownEntry?: Maybe<LeaderboardEntry>;
  totalCount: Scalars['Int']['output'];
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
  adminDeleteTemplate: Scalars['UUID']['output'];
  adminDeleteTemplateTag: Scalars['UUID']['output'];
  adminDeleteUserById: Scalars['UUID']['output'];
  adminTransferRoom: AdminRoom;
  adminUpdateTemplateTagName: TemplateTag;
  adminUpdateTemplateTagVerified: TemplateTag;
  adminVerifyUserById: AdminUser;
  banQuestionnaireShortAnswerContentKeyword?: Maybe<Content>;
  banQuestionnaireWordcloudContentKeyword?: Maybe<Content>;
  claimUnverifiedUser?: Maybe<User>;
  copyQuestionnaireContentToQuestionnaire?: Maybe<Content>;
  createAnnouncement: Announcement;
  createQnaPost: Post;
  createQnaReply: Reply;
  createQnaTag: Tag;
  createQuestionnaire: Questionnaire;
  createQuestionnaireAbstention?: Maybe<Answer>;
  createQuestionnaireBinaryAnswer?: Maybe<Answer>;
  createQuestionnaireBinaryContent?: Maybe<Content>;
  createQuestionnaireChoiceAnswer?: Maybe<Answer>;
  createQuestionnaireChoiceContent?: Maybe<Content>;
  createQuestionnaireFlashcardContent?: Maybe<Content>;
  createQuestionnaireFromTemplate: Questionnaire;
  createQuestionnaireNumericAnswer?: Maybe<Answer>;
  createQuestionnaireNumericContent?: Maybe<Content>;
  createQuestionnairePrioritizationAnswer?: Maybe<Answer>;
  createQuestionnairePrioritizationContent?: Maybe<Content>;
  createQuestionnaireScaleAnswer?: Maybe<Answer>;
  createQuestionnaireScaleContent?: Maybe<Content>;
  createQuestionnaireShortAnswerAnswer?: Maybe<Answer>;
  createQuestionnaireShortAnswerContent?: Maybe<Content>;
  createQuestionnaireSlideContent?: Maybe<Content>;
  createQuestionnaireSortAnswer?: Maybe<Answer>;
  createQuestionnaireSortContent?: Maybe<Content>;
  createQuestionnaireTextAnswer?: Maybe<Answer>;
  createQuestionnaireTextContent?: Maybe<Content>;
  createQuestionnaireWordcloudAnswer?: Maybe<Answer>;
  createQuestionnaireWordcloudContent?: Maybe<Content>;
  createRoom: Room;
  createTemplateFromQuestionnaire: Template;
  deleteAnnouncement: Scalars['ID']['output'];
  deleteQnaPost: Scalars['ID']['output'];
  deleteQnaPostsByQnaId: Scalars['Int']['output'];
  deleteQnaReply: Scalars['ID']['output'];
  deleteQnaTag: Scalars['ID']['output'];
  deleteQuestionnaire?: Maybe<Scalars['ID']['output']>;
  deleteQuestionnaireAnswersByContentId?: Maybe<Scalars['Boolean']['output']>;
  deleteQuestionnaireContent?: Maybe<Scalars['ID']['output']>;
  deleteRoom: Scalars['UUID']['output'];
  deleteTemplate: Scalars['UUID']['output'];
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
  resetBannedQuestionnaireShortAnswerContentKeywords?: Maybe<Content>;
  resetBannedQuestionnaireWordcloudContentKeywords?: Maybe<Content>;
  resetQuestionnaireResults?: Maybe<Scalars['Boolean']['output']>;
  resetUserPassword?: Maybe<User>;
  revokeRoomMembership: RoomMembership;
  revokeRoomRole: RoomMember;
  setRoomUserAlias: RoomUserAlias;
  startQna: Qna;
  startQuestionnaireContent: Questionnaire;
  startQuestionnaireContentRound: Round;
  stopQna: Qna;
  stopQuestionnaireContent: Questionnaire;
  toggleQuestionnairePublished: Questionnaire;
  toggleQuestionnaireTextAnswerHidden?: Maybe<Answer>;
  toggleQuestionnaireTextContentAnswersPublished?: Maybe<Content>;
  updateAnnouncement: Announcement;
  updateQnaActivePostId: Qna;
  updateQnaAutoPublish: Qna;
  updateQnaPostCorrect: Post;
  updateQnaPostFavorite: Post;
  updateQnaReply: Reply;
  updateQnaThreshold: Qna;
  updateQuestionnaire: Questionnaire;
  updateQuestionnaireBinaryContent?: Maybe<Content>;
  updateQuestionnaireChoiceContent?: Maybe<Content>;
  updateQuestionnaireContentOrder?: Maybe<Questionnaire>;
  updateQuestionnaireFlashcardContent?: Maybe<Content>;
  updateQuestionnaireNumericContent?: Maybe<Content>;
  updateQuestionnairePrioritizationContent?: Maybe<Content>;
  updateQuestionnaireScaleContent?: Maybe<Content>;
  updateQuestionnaireShortAnswerContent?: Maybe<Content>;
  updateQuestionnaireSlideContent?: Maybe<Content>;
  updateQuestionnaireSortContent?: Maybe<Content>;
  updateQuestionnaireTextContent?: Maybe<Content>;
  updateQuestionnaireWordcloudContent?: Maybe<Content>;
  updateRoomDescription: Room;
  updateRoomFocusMode: Room;
  updateRoomLanguage: Room;
  updateRoomName: Room;
  updateTemplate: Template;
  updateTemplateFromSource: Template;
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

export type MutationAdminDeleteTemplateArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationAdminDeleteTemplateTagArgs = {
  id: Scalars['UUID']['input'];
};

export type MutationAdminDeleteUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type MutationAdminTransferRoomArgs = {
  roomId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type MutationAdminUpdateTemplateTagNameArgs = {
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
};

export type MutationAdminUpdateTemplateTagVerifiedArgs = {
  id: Scalars['UUID']['input'];
  verified: Scalars['Boolean']['input'];
};

export type MutationAdminVerifyUserByIdArgs = {
  id: Scalars['ID']['input'];
};

export type MutationBanQuestionnaireShortAnswerContentKeywordArgs = {
  contentId: Scalars['UUID']['input'];
  keyword: Scalars['String']['input'];
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

export type MutationCreateQuestionnaireBinaryAnswerArgs = {
  input: CreateBinaryAnswerInput;
};

export type MutationCreateQuestionnaireBinaryContentArgs = {
  input: CreateBinaryContentInput;
};

export type MutationCreateQuestionnaireChoiceAnswerArgs = {
  input: CreateChoiceAnswerInput;
};

export type MutationCreateQuestionnaireChoiceContentArgs = {
  input: CreateChoiceContentInput;
};

export type MutationCreateQuestionnaireFlashcardContentArgs = {
  input: CreateFlashcardContentInput;
};

export type MutationCreateQuestionnaireFromTemplateArgs = {
  input: CreateQuestionnaireFromTemplateInput;
};

export type MutationCreateQuestionnaireNumericAnswerArgs = {
  input: CreateNumericAnswerInput;
};

export type MutationCreateQuestionnaireNumericContentArgs = {
  input: CreateNumericContentInput;
};

export type MutationCreateQuestionnairePrioritizationAnswerArgs = {
  input: CreatePrioritizationAnswerInput;
};

export type MutationCreateQuestionnairePrioritizationContentArgs = {
  input: CreatePrioritizationContentInput;
};

export type MutationCreateQuestionnaireScaleAnswerArgs = {
  input: CreateScaleAnswerInput;
};

export type MutationCreateQuestionnaireScaleContentArgs = {
  input: CreateScaleContentInput;
};

export type MutationCreateQuestionnaireShortAnswerAnswerArgs = {
  input: CreateShortAnswerAnswerInput;
};

export type MutationCreateQuestionnaireShortAnswerContentArgs = {
  input: CreateShortAnswerContentInput;
};

export type MutationCreateQuestionnaireSlideContentArgs = {
  input: CreateSlideContentInput;
};

export type MutationCreateQuestionnaireSortAnswerArgs = {
  input: CreateSortAnswerInput;
};

export type MutationCreateQuestionnaireSortContentArgs = {
  input: CreateSortContentInput;
};

export type MutationCreateQuestionnaireTextAnswerArgs = {
  input: CreateTextAnswerInput;
};

export type MutationCreateQuestionnaireTextContentArgs = {
  input: CreateTextContentInput;
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

export type MutationCreateTemplateFromQuestionnaireArgs = {
  input: CreateTemplateFromQuestionnaireInput;
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

export type MutationDeleteTemplateArgs = {
  id: Scalars['UUID']['input'];
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

export type MutationResetBannedQuestionnaireShortAnswerContentKeywordsArgs = {
  contentId: Scalars['UUID']['input'];
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

export type MutationSetRoomUserAliasArgs = {
  input: SetRoomUserAliasInput;
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

export type MutationToggleQuestionnaireTextAnswerHiddenArgs = {
  answerId: Scalars['UUID']['input'];
  hidden: Scalars['Boolean']['input'];
};

export type MutationToggleQuestionnaireTextContentAnswersPublishedArgs = {
  contentId: Scalars['UUID']['input'];
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

export type MutationUpdateQuestionnaireBinaryContentArgs = {
  input: UpdateBinaryContentInput;
};

export type MutationUpdateQuestionnaireChoiceContentArgs = {
  input: UpdateChoiceContentInput;
};

export type MutationUpdateQuestionnaireContentOrderArgs = {
  contentIds: Array<Scalars['UUID']['input']>;
  questionnaireId: Scalars['UUID']['input'];
};

export type MutationUpdateQuestionnaireFlashcardContentArgs = {
  input: UpdateFlashcardContentInput;
};

export type MutationUpdateQuestionnaireNumericContentArgs = {
  input: UpdateNumericContentInput;
};

export type MutationUpdateQuestionnairePrioritizationContentArgs = {
  input: UpdatePrioritizationContentInput;
};

export type MutationUpdateQuestionnaireScaleContentArgs = {
  input: UpdateScaleContentInput;
};

export type MutationUpdateQuestionnaireShortAnswerContentArgs = {
  input: UpdateShortAnswerContentInput;
};

export type MutationUpdateQuestionnaireSlideContentArgs = {
  input: UpdateSlideContentInput;
};

export type MutationUpdateQuestionnaireSortContentArgs = {
  input: UpdateSortContentInput;
};

export type MutationUpdateQuestionnaireTextContentArgs = {
  input: UpdateTextContentInput;
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

export type MutationUpdateTemplateArgs = {
  input: UpdateTemplateInput;
};

export type MutationUpdateTemplateFromSourceArgs = {
  id: Scalars['UUID']['input'];
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

export type NumericAnswerFormatData = {
  __typename?: 'NumericAnswerFormatData';
  format: ContentType;
  selectedNumber: Scalars['Float']['output'];
};

export type NumericContentFormatData = {
  __typename?: 'NumericContentFormatData';
  correctNumber?: Maybe<Scalars['Float']['output']>;
  format: ContentType;
  maxNumber: Scalars['Float']['output'];
  minNumber: Scalars['Float']['output'];
  tolerance: Scalars['Float']['output'];
};

export type NumericContentRoundStats = {
  __typename?: 'NumericContentRoundStats';
  correctAnswerFraction?: Maybe<Scalars['Float']['output']>;
  counts?: Maybe<Array<Scalars['Int']['output']>>;
  maximum: Scalars['Float']['output'];
  mean: Scalars['Float']['output'];
  median: Scalars['Float']['output'];
  minimum: Scalars['Float']['output'];
  selectedNumbers?: Maybe<Array<Scalars['Float']['output']>>;
  standardDeviation: Scalars['Float']['output'];
  variance: Scalars['Float']['output'];
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

export type PrioritizationAnswerFormatData = {
  __typename?: 'PrioritizationAnswerFormatData';
  assignedPoints: Array<Scalars['Int']['output']>;
  format: ContentType;
};

export type PrioritizationContentFormatData = {
  __typename?: 'PrioritizationContentFormatData';
  assignablePoints: Scalars['Int']['output'];
  format: ContentType;
  options: Array<AnswerOption>;
};

export type PrioritizationContentRoundStats = {
  __typename?: 'PrioritizationContentRoundStats';
  assignedPoints?: Maybe<Array<Scalars['Int']['output']>>;
};

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
  currentUserTemplates?: Maybe<TemplateConnection>;
  publishedQuestionnairesByRoomId?: Maybe<Array<Questionnaire>>;
  publishedTemplates?: Maybe<TemplateConnection>;
  qnaPostCountsByQnaId?: Maybe<PostCountSummary>;
  qnaPostsByQnaId?: Maybe<PostConnection>;
  qnasByRoomId?: Maybe<QnaConnection>;
  questionnaireAnswerByRoundId?: Maybe<Answer>;
  questionnaireAnswerResultsByQuestionnaireId?: Maybe<QuestionnaireAnswerResult>;
  questionnaireBinaryRoundStatsByRoundId?: Maybe<BinaryContentRoundStats>;
  questionnaireById?: Maybe<Questionnaire>;
  questionnaireChoiceRoundStatsByRoundId?: Maybe<ChoiceContentRoundStats>;
  questionnaireContentAnswerResultsByQuestionnaireId?: Maybe<
    Array<ContentAnswerResult>
  >;
  questionnaireContentById?: Maybe<Content>;
  questionnaireContentsByQuestionnaireId?: Maybe<ContentConnection>;
  questionnaireLeaderboardByQuestionnaireId: LeaderboardPage;
  questionnaireNumericRoundStatsByRoundId?: Maybe<NumericContentRoundStats>;
  questionnairePrioritizationRoundStatsByRoundId?: Maybe<PrioritizationContentRoundStats>;
  questionnairePublishedContentsByQuestionnaireId?: Maybe<ContentConnection>;
  questionnaireRoundsByContentId?: Maybe<Array<Round>>;
  questionnaireScaleRoundStatsByRoundId?: Maybe<ScaleContentRoundStats>;
  questionnaireShortAnswerRoundStatsByRoundId?: Maybe<ShortAnswerContentRoundStats>;
  questionnaireSortRoundStatsByRoundId?: Maybe<SortContentRoundStats>;
  questionnaireTextAnswersByRoundId?: Maybe<Array<Answer>>;
  questionnaireWordcloudRoundStatsByRoundId?: Maybe<WordcloudContentRoundStats>;
  questionnairesByRoomId?: Maybe<Array<Questionnaire>>;
  roomById?: Maybe<Room>;
  roomByShortId?: Maybe<Room>;
  roomManagingMembersByRoomId?: Maybe<Array<RoomMember>>;
  roomMembershipById?: Maybe<RoomMembership>;
  roomMembershipByShortId?: Maybe<RoomMembership>;
  roomMemberships?: Maybe<RoomMembershipConnection>;
  roomUserAliasByRoomId: RoomUserAlias;
  rooms?: Maybe<RoomConnection>;
  roomsByUserId?: Maybe<RoomMembershipConnection>;
  templateById?: Maybe<Template>;
  templateContentAttributionsByQuestionnaireId: Array<TemplateContentAttribution>;
  templateLicenses: Array<TemplateLicense>;
  templateTagsByLanguage: Array<TemplateTag>;
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

export type QueryCurrentUserTemplatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPublishedQuestionnairesByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
};

export type QueryPublishedTemplatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<TemplateQueryInput>;
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

export type QueryQuestionnaireBinaryRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
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

export type QueryQuestionnaireLeaderboardByQuestionnaireIdArgs = {
  contentId?: InputMaybe<Scalars['UUID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireNumericRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnairePrioritizationRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnairePublishedContentsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireRoundsByContentIdArgs = {
  contentId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireScaleRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireShortAnswerRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireSortRoundStatsByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
};

export type QueryQuestionnaireTextAnswersByRoundIdArgs = {
  roundId: Scalars['UUID']['input'];
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

export type QueryRoomUserAliasByRoomIdArgs = {
  roomId: Scalars['UUID']['input'];
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

export type QueryTemplateByIdArgs = {
  id: Scalars['UUID']['input'];
};

export type QueryTemplateContentAttributionsByQuestionnaireIdArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type QueryTemplateTagsByLanguageArgs = {
  language: Scalars['String']['input'];
  verified?: Scalars['Boolean']['input'];
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
  sourceTemplateId?: Maybe<Scalars['ID']['output']>;
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

export type RoomUserAlias = {
  __typename?: 'RoomUserAlias';
  alias: Scalars['String']['output'];
  /** Not set for aliases which have not been persisted yet. */
  id?: Maybe<Scalars['ID']['output']>;
  seed: Scalars['Int']['output'];
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

export type ScaleAnswerFormatData = {
  __typename?: 'ScaleAnswerFormatData';
  format: ContentType;
  rating: Scalars['Int']['output'];
};

export type ScaleContentFormatData = {
  __typename?: 'ScaleContentFormatData';
  format: ContentType;
  neutralOption: Scalars['Boolean']['output'];
  template: ScaleContentTemplate;
};

export type ScaleContentRoundStats = {
  __typename?: 'ScaleContentRoundStats';
  counts?: Maybe<Array<Scalars['Int']['output']>>;
};

export enum ScaleContentTemplate {
  Agreement = 'AGREEMENT',
  Difficulty = 'DIFFICULTY',
  Emoji = 'EMOJI',
  Frequency = 'FREQUENCY',
  Importance = 'IMPORTANCE',
  Intensity = 'INTENSITY',
  Level = 'LEVEL',
  Pace = 'PACE',
  PlusMinus = 'PLUS_MINUS',
  Points = 'POINTS',
  Probability = 'PROBABILITY',
  Quality = 'QUALITY',
}

export type SetRoomUserAliasInput = {
  alias?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['UUID']['input'];
  seed?: InputMaybe<Scalars['Int']['input']>;
};

export type ShortAnswerAnswerFormatData = {
  __typename?: 'ShortAnswerAnswerFormatData';
  body: Scalars['String']['output'];
  format: ContentType;
};

export type ShortAnswerContentFormatData = {
  __typename?: 'ShortAnswerContentFormatData';
  correctTerms: Array<Scalars['String']['output']>;
  format: ContentType;
};

export type ShortAnswerContentRoundStats = {
  __typename?: 'ShortAnswerContentRoundStats';
  counts?: Maybe<Array<Scalars['Int']['output']>>;
  texts?: Maybe<Array<Scalars['String']['output']>>;
};

export type SlideContentFormatData = {
  __typename?: 'SlideContentFormatData';
  format: ContentType;
};

export type SortAnswerFormatData = {
  __typename?: 'SortAnswerFormatData';
  format: ContentType;
  selectedChoiceIndexes: Array<Scalars['Int']['output']>;
};

export type SortCombination = {
  __typename?: 'SortCombination';
  count: Scalars['Int']['output'];
  selectedChoiceIndexes: Array<Scalars['Int']['output']>;
};

export type SortContentFormatData = {
  __typename?: 'SortContentFormatData';
  correctOrder?: Maybe<Array<Scalars['Int']['output']>>;
  format: ContentType;
  options: Array<AnswerOption>;
};

export type SortContentRoundStats = {
  __typename?: 'SortContentRoundStats';
  combinations?: Maybe<Array<SortCombination>>;
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
  questionnaireBinaryRoundStatsUpdated?: Maybe<BinaryContentRoundStats>;
  questionnaireChoiceRoundStatsUpdated?: Maybe<ChoiceContentRoundStats>;
  questionnaireContentUpdated?: Maybe<Content>;
  questionnaireLeaderboardUpdated: LeaderboardPage;
  questionnaireNumericRoundStatsUpdated?: Maybe<NumericContentRoundStats>;
  questionnairePrioritizationRoundStatsUpdated?: Maybe<PrioritizationContentRoundStats>;
  questionnaireScaleRoundStatsUpdated?: Maybe<ScaleContentRoundStats>;
  questionnaireShortAnswerRoundStatsUpdated?: Maybe<ShortAnswerContentRoundStats>;
  questionnaireSortRoundStatsUpdated?: Maybe<SortContentRoundStats>;
  questionnaireTextAnswersUpdated?: Maybe<Array<Answer>>;
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

export type SubscriptionQuestionnaireBinaryRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireChoiceRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireContentUpdatedArgs = {
  questionnaireId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireLeaderboardUpdatedArgs = {
  contentId?: InputMaybe<Scalars['UUID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  questionnaireId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireNumericRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnairePrioritizationRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireScaleRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireShortAnswerRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireSortRoundStatsUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
};

export type SubscriptionQuestionnaireTextAnswersUpdatedArgs = {
  roundId: Scalars['UUID']['input'];
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

export type Template = {
  __typename?: 'Template';
  aiGenerated: Scalars['Boolean']['output'];
  attribution?: Maybe<Scalars['String']['output']>;
  contentCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByCurrentUser: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  language: Scalars['String']['output'];
  license?: Maybe<TemplateLicense>;
  name: Scalars['String']['output'];
  published: Scalars['Boolean']['output'];
  questionnaireId: Scalars['ID']['output'];
  questionnaireType: QuestionnaireType;
  sourceQuestionnaireId?: Maybe<Scalars['ID']['output']>;
  tags: Array<TemplateTag>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type TemplateConnection = {
  __typename?: 'TemplateConnection';
  edges?: Maybe<Array<Maybe<TemplateEdge>>>;
  pageInfo: PageInfo;
};

export type TemplateContentAttribution = {
  __typename?: 'TemplateContentAttribution';
  attribution?: Maybe<Scalars['String']['output']>;
  contentId: Scalars['ID']['output'];
  license?: Maybe<TemplateLicense>;
  templateId: Scalars['ID']['output'];
  upstreamAttributions: Array<TemplateUpstreamAttribution>;
};

export type TemplateEdge = {
  __typename?: 'TemplateEdge';
  cursor: Scalars['String']['output'];
  node: Template;
};

export type TemplateLicense = {
  __typename?: 'TemplateLicense';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  url?: Maybe<Scalars['String']['output']>;
};

export type TemplateQueryInput = {
  language?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type TemplateTag = {
  __typename?: 'TemplateTag';
  id: Scalars['ID']['output'];
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type TemplateUpstreamAttribution = {
  __typename?: 'TemplateUpstreamAttribution';
  attribution?: Maybe<Scalars['String']['output']>;
  license?: Maybe<TemplateLicense>;
  templateId: Scalars['ID']['output'];
};

export type TextAnswerFormatData = {
  __typename?: 'TextAnswerFormatData';
  body: Scalars['String']['output'];
  format: ContentType;
};

export type TextContentFormatData = {
  __typename?: 'TextContentFormatData';
  answersPublished: Scalars['Boolean']['output'];
  format: ContentType;
};

export type UpdateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBinaryContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctAnswer?: InputMaybe<Scalars['Boolean']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
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

export type UpdateFlashcardContentInput = {
  answer: Scalars['String']['input'];
  body: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
};

export type UpdateNumericContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctNumber?: InputMaybe<Scalars['Float']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  maxNumber: Scalars['Float']['input'];
  minNumber: Scalars['Float']['input'];
  tolerance?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdatePrioritizationContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  options: Array<Scalars['String']['input']>;
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

export type UpdateScaleContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  neutralOption: Scalars['Boolean']['input'];
  template: ScaleContentTemplate;
};

export type UpdateShortAnswerContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  correctTerms: Array<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSlideContentInput = {
  body: Scalars['String']['input'];
  id: Scalars['UUID']['input'];
};

export type UpdateSortContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
  options: Array<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTemplateInput = {
  aiGenerated?: InputMaybe<Scalars['Boolean']['input']>;
  attribution?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  language?: InputMaybe<Scalars['String']['input']>;
  licenseId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  tagNames?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateTextContentInput = {
  abstentionsAllowed?: InputMaybe<Scalars['Boolean']['input']>;
  body: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['UUID']['input'];
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
