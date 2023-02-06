export class CommentSettings {
  roomId: string;
  directSend: boolean;
  fileUploadEnabled: boolean;
  disabled: boolean;
  readonly: boolean;

  constructor(
    roomId = '',
    directSend = true,
    fileUploadEnabled = false,
    disabled = false,
    readonly = false
  ) {
    this.roomId = roomId;
    this.directSend = directSend;
    this.fileUploadEnabled = fileUploadEnabled;
    this.disabled = disabled;
    this.readonly = readonly;
  }
}
