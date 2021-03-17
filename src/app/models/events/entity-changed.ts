import { Entity } from "../entity";

export class EntityChanged<T extends Entity> {
  type: string;
  payload: {
    id: string,
    roomId: string,
    entity: T,
    changedProperties: string[]
  };

  constructor(entity: T, changedProperties: string[]) {
    const roomId = entity['roomId'] ?? entity.id;
    this.type = 'EntityChanged';
    this.payload = {
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
