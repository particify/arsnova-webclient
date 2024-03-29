// TODO: non-null assertion operator is used here temporaly. We need to find good structure for our models.
export abstract class DataChanged<T> {
  type!: string;
  payload: {
    dataType: string;
    roomId: string;
    data: T;
  };

  constructor(dataType: string, roomId: string, data: T) {
    this.payload = {
      dataType: dataType,
      roomId: roomId,
      data: data,
    };
  }
}

export class PublicDataChanged<T> extends DataChanged<T> {
  type = 'PublicDataChanged';
}

export class ModeratorDataChanged<T> extends DataChanged<T> {
  type = 'ModeratorDataChanged';
}
