import { Entity } from "../entity";

export class EntityChanged<T extends Entity> {
  type: string;
  payload: {
    entityType: string,
    id: string,
    roomId: string,
    entity: T,
    changedProperties: string[]
  };

  constructor(entityType: string, entity: T, changedProperties: string[]) {
    const roomId = entity['roomId'] ?? entity.id;
    this.type = 'EntityChanged';
    this.payload = {
      entityType: entityType,
      id: entity.id,
      roomId: roomId,
      entity: entity,
      changedProperties: changedProperties
    };
  }

  hasPropertyChanged(propertyName: string): boolean {
    return this.payload.changedProperties.includes(propertyName);
  }
}
