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
  edges: Array<Maybe<AnnouncementEdge>>;
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

export type CreateAnnouncementInput = {
  body: Scalars['String']['input'];
  roomId: Scalars['UUID']['input'];
  title: Scalars['String']['input'];
};

export type CreateRoomInput = {
  name: Scalars['String']['input'];
};

export type DuplicateRoomInput = {
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
};

export type JoinRoomInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  shortId?: InputMaybe<Scalars['ID']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAnnouncement: Announcement;
  createRoom: Room;
  deleteAnnouncement: Scalars['ID']['output'];
  deleteRoom: Scalars['Boolean']['output'];
  duplicateDemoRoom: Room;
  duplicateRoom: Room;
  grantRoomRole: Scalars['Boolean']['output'];
  joinRoom: RoomMembership;
  revokeRoomRole: Scalars['Boolean']['output'];
  updateAnnouncement: Announcement;
  updateRoom: Room;
};

export type MutationCreateAnnouncementArgs = {
  input: CreateAnnouncementInput;
};

export type MutationCreateRoomArgs = {
  input: CreateRoomInput;
};

export type MutationDeleteAnnouncementArgs = {
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

export type MutationJoinRoomArgs = {
  input: JoinRoomInput;
};

export type MutationRevokeRoomRoleArgs = {
  roomId: Scalars['UUID']['input'];
  userId: Scalars['UUID']['input'];
};

export type MutationUpdateAnnouncementArgs = {
  input?: InputMaybe<UpdateAnnouncementInput>;
};

export type MutationUpdateRoomArgs = {
  input: UpdateRoomInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  announcementsByRoomId?: Maybe<AnnouncementConnection>;
  announcementsByUserId?: Maybe<AnnouncementConnection>;
  announcementsForCurrentUser?: Maybe<AnnouncementConnection>;
  announcementsMetaForCurrentUser?: Maybe<AnnouncementsMeta>;
  roomById?: Maybe<Room>;
  roomByShortId?: Maybe<Room>;
  roomManagingMembersByRoomId?: Maybe<Array<RoomMember>>;
  roomMembershipById?: Maybe<RoomMembership>;
  roomMembershipByShortId?: Maybe<RoomMembership>;
  roomMemberships?: Maybe<RoomMembershipConnection>;
  rooms?: Maybe<RoomConnection>;
  roomsByUserId?: Maybe<RoomMembershipConnection>;
  userById?: Maybe<User>;
  users?: Maybe<UserConnection>;
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

export type QueryRoomByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryRoomByShortIdArgs = {
  shortId: Scalars['ID']['input'];
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

export type QueryUserByIdArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  user: UserQueryInput;
};

export type Room = {
  __typename?: 'Room';
  description?: Maybe<Scalars['String']['output']>;
  descriptionRendered?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  shortId: Scalars['ID']['output'];
};

export type RoomConnection = {
  __typename?: 'RoomConnection';
  edges: Array<Maybe<RoomEdge>>;
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
  user?: Maybe<User>;
};

export type RoomMembership = {
  __typename?: 'RoomMembership';
  lastActivityAt: Scalars['DateTime']['output'];
  role: RoomRole;
  room: Room;
  stats?: Maybe<RoomStats>;
};

export type RoomMembershipConnection = {
  __typename?: 'RoomMembershipConnection';
  edges: Array<Maybe<RoomMembershipEdge>>;
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
  ackCommentCount?: Maybe<Scalars['Int']['output']>;
  contentCount?: Maybe<Scalars['Int']['output']>;
  roomUserCount?: Maybe<Scalars['Int']['output']>;
};

export type UpdateAnnouncementInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoomInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  givenName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mailAddress?: Maybe<Scalars['String']['output']>;
  surname?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges: Array<Maybe<UserEdge>>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export type UserQueryInput = {
  username?: InputMaybe<Scalars['String']['input']>;
};

export type RoomDetailsFragmentFragment = {
  __typename?: 'Room';
  id: string;
  shortId: string;
  name: string;
  description?: string | null;
  descriptionRendered?: string | null;
};

export type RoomMembershipFragmentFragment = {
  __typename?: 'RoomMembership';
  role: RoomRole;
  room: { __typename?: 'Room'; id: string; shortId: string; name: string };
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
    edges: Array<{
      __typename?: 'RoomEdge';
      cursor: string;
      node: {
        __typename?: 'Room';
        id: string;
        shortId: string;
        name: string;
        description?: string | null;
        descriptionRendered?: string | null;
      };
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
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
    room: { __typename?: 'Room'; id: string; shortId: string; name: string };
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
    edges: Array<{
      __typename?: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename?: 'RoomMembership';
        role: RoomRole;
        stats?: {
          __typename?: 'RoomStats';
          roomUserCount?: number | null;
          contentCount?: number | null;
          ackCommentCount?: number | null;
        } | null;
        room: {
          __typename?: 'Room';
          id: string;
          shortId: string;
          name: string;
        };
      };
    } | null>;
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
    edges: Array<{
      __typename?: 'RoomMembershipEdge';
      cursor: string;
      node: {
        __typename?: 'RoomMembership';
        role: RoomRole;
        stats?: {
          __typename?: 'RoomStats';
          roomUserCount?: number | null;
          contentCount?: number | null;
          ackCommentCount?: number | null;
        } | null;
        room: {
          __typename?: 'Room';
          id: string;
          shortId: string;
          name: string;
        };
      };
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
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
    room: { __typename?: 'Room'; id: string; shortId: string; name: string };
  };
};

export type CreateRoomMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;

export type CreateRoomMutation = {
  __typename?: 'Mutation';
  createRoom: { __typename?: 'Room'; id: string; shortId: string };
};

export type DuplicateRoomMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  newName: Scalars['String']['input'];
}>;

export type DuplicateRoomMutation = {
  __typename?: 'Mutation';
  duplicateRoom: { __typename?: 'Room'; id: string; shortId: string };
};

export type UserFragmentFragment = {
  __typename?: 'User';
  id: string;
  username: string;
};

export type UserByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type UserByIdQuery = {
  __typename?: 'Query';
  userById?: { __typename?: 'User'; id: string; username: string } | null;
};

export type UsersQueryVariables = Exact<{
  query: UserQueryInput;
  cursor?: InputMaybe<Scalars['String']['input']>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  users?: {
    __typename?: 'UserConnection';
    edges: Array<{
      __typename?: 'UserEdge';
      cursor: string;
      node: { __typename?: 'User'; id: string; username: string };
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
    };
  } | null;
};

export const RoomDetailsFragmentFragmentDoc = gql`
  fragment RoomDetailsFragment on Room {
    id
    shortId
    name
    description
    descriptionRendered
  }
`;
export const RoomMembershipFragmentFragmentDoc = gql`
  fragment RoomMembershipFragment on RoomMembership {
    room {
      id
      shortId
      name
    }
    role
  }
`;
export const UserFragmentFragmentDoc = gql`
  fragment UserFragment on User {
    id
    username
  }
`;
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
export const RoomMembershipByShortIdDocument = gql`
  query RoomMembershipByShortId($shortId: String!) {
    roomMembershipByShortId(shortId: $shortId) {
      ...RoomMembershipFragment
    }
  }
  ${RoomMembershipFragmentFragmentDoc}
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
          ...RoomMembershipFragment
          stats {
            roomUserCount
            contentCount
            ackCommentCount
          }
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
  ${RoomMembershipFragmentFragmentDoc}
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
          ...RoomMembershipFragment
          stats {
            roomUserCount
            contentCount
            ackCommentCount
          }
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
  ${RoomMembershipFragmentFragmentDoc}
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
export const JoinRoomDocument = gql`
  mutation JoinRoom($shortId: ID!) {
    joinRoom(input: { shortId: $shortId }) {
      ...RoomMembershipFragment
    }
  }
  ${RoomMembershipFragmentFragmentDoc}
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
export const UserByIdDocument = gql`
  query UserById($id: ID!) {
    userById(id: $id) {
      ...UserFragment
    }
  }
  ${UserFragmentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UserByIdGql extends Apollo.Query<
  UserByIdQuery,
  UserByIdQueryVariables
> {
  document = UserByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const UsersDocument = gql`
  query Users($query: UserQueryInput!, $cursor: String) {
    users(user: $query, first: 10, after: $cursor) {
      edges {
        node {
          ...UserFragment
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
  ${UserFragmentFragmentDoc}
`;

@Injectable({
  providedIn: 'root',
})
export class UsersGql extends Apollo.Query<UsersQuery, UsersQueryVariables> {
  document = UsersDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
