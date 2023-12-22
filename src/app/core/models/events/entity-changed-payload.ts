// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export class EntityChangedPayload<T> {
  entityType!: string;
  id!: string;
  roomId!: string;
  entity!: T;
  changedProperties!: string[];
}
