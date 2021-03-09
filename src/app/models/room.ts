export class Room {
  id: string;
  revision: string;
  ownerId: string;
  shortId: string;
  abbreviation: string;
  name: string;
  description: string;
  renderedDescription: string;
  closed: boolean;
  settings: object;
  extensions: { [key: string ]: object };

  constructor(
    ownerId: string = '',
    shortId: string = '',
    abbreviation: string = '',
    name: string = '',
    description: string = '',
    closed: boolean = false,
    extensions: { [key: string ]: object } = {}
  ) {
    this.id = '';
    this.ownerId = ownerId;
    this.shortId = shortId;
    this.abbreviation = abbreviation;
    this.name = name;
    this.description = description;
    this.closed = closed;
    this.extensions = extensions;
  }
}
