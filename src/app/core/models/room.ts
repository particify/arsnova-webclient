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
}
