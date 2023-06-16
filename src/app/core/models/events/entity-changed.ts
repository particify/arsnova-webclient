import { Entity } from '@app/core/models/entity';
import { EntityChangedPayload } from '@app/core/models/events/entity-changed-payload';

export class EntityChanged<T extends Entity> {
  type: string;
  payload: EntityChangedPayload<T>;

  constructor(entityType: string, entity: T, changedProperties: string[]) {
    const roomId = entity['roomId'] ?? entity.id;
    this.type = 'EntityChanged';
    this.payload = {
      entityType: entityType,
      id: entity.id,
      roomId: roomId,
      entity: entity,
      changedProperties: changedProperties,
    };
  }

  hasPropertyChanged(propertyName: string): boolean {
    return this.payload.changedProperties.includes(propertyName);
  }
}
