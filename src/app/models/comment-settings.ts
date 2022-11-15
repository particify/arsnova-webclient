export class CommentSettings {
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;

  constructor(roomId = '', directSend = true, fileUploadEnabled = false) {
    this.roomId = roomId;
    this.directSend = directSend;
    this.fileUploadEnabled = fileUploadEnabled;
  }
}
