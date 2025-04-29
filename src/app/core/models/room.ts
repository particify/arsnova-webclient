import { Room as RoomGql } from '@gql/generated/graphql';

// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
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

  static fromGql(roomData: RoomGql) {
    const room = new Room();
    room.id = roomData.id;
    room.shortId = roomData.shortId;
    room.name = roomData.name;
    room.description = roomData.description ?? '';
    room.renderedDescription = roomData.descriptionRendered ?? '';
    return room;
  }
}
