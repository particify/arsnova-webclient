export class HttpRequestFailed {
  type: string;
  payload: {
    status: number,
    statusText: string,
    url: string
  };

  constructor(status: number, statusText: string, url: string) {
    this.type = 'HttpRequestFailed';
    this.payload = {
      status: status,
      statusText: statusText,
      url: url
    };
  }
}
