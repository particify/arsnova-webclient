export enum ChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export class EntityChangeNotification {
  type: string;
  payload: {
    changeType: ChangeType,
    entityType: string,
    id: string,
    roomId: string
  };

  constructor(changeType: ChangeType, entityType: string, id: string, roomId: string) {
    this.type = 'EntityChangeNotification';
    this.payload = {
      changeType: changeType,
      entityType: entityType,
      id: id,
      roomId: roomId
    };
  }
}
