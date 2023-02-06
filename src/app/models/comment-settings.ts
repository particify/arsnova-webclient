export class CommentSettings {
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;
  disabled: boolean;

  constructor(
    roomId = '',
    directSend = true,
    fileUploadEnabled = false,
    disabled = false
  ) {
    this.roomId = roomId;
    this.directSend = directSend;
    this.fileUploadEnabled = fileUploadEnabled;
    this.disabled = disabled;
  }
}
