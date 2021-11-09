export class CommentSettings {
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;

  constructor(roomId: string = '', directSend: boolean = true, fileUploadEnabled = false) {
    this.roomId = roomId;
    this.directSend = directSend;
    this.fileUploadEnabled = fileUploadEnabled;
  }
}
