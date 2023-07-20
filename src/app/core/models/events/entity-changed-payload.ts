export class EntityChangedPayload<T> {
  entityType: string;
  id: string;
  roomId: string;
  entity: T;
  changedProperties: string[];
}
