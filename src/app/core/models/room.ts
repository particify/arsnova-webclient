import { Room as RoomGql } from '@gql/generated/graphql';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
/**
 * Legacy type which was used by the v3 API.
 * While the v3 API is no longer used for rooms, some components still use it internally.
 * It should not be used for new components.
 *
 * @deprecated
 */
export class Room {
  id!: string;
  revision!: string;
  ownerId: string;
  shortId: string;
  abbreviation: string;
  name: string;
  description: string;
  renderedDescription!: string;
  passwordProtected = false;
  closed: boolean;
  language?: string;
  lmsCourseId?: string;

  constructor(
    ownerId = '',
    shortId = '',
    abbreviation = '',
    name = '',
    description = '',
    closed = false
  ) {
    this.ownerId = ownerId;
    this.shortId = shortId;
    this.abbreviation = abbreviation;
    this.name = name;
    this.description = description;
    this.closed = closed;
  }

  static fromGql(roomData: RoomGql, legacyIdPattern = false) {
    const room = new Room();
    room.id = legacyIdPattern ? roomData.id.replaceAll('-', '') : roomData.id;
    room.shortId = roomData.shortId;
    room.name = roomData.name;
    room.description = roomData.description ?? '';
    room.renderedDescription = roomData.descriptionRendered ?? '';
    return room;
  }
}
