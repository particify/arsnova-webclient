import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';


@Injectable()
export class LocalFileService {
  save(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.click();
  }

  download(data: Observable<Blob>, filename: string) {
    data.subscribe(blob => this.save(blob, filename));
  }

  upload(accept?: string[]): Observable<Blob> {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) {
      input.setAttribute('accept', accept.join(','));
    }
    input.click();
    const fileChanged = fromEvent(input, 'change');
    return fileChanged.pipe(
      filter(e => (e.target as HTMLInputElement).files.length > 0),
      map(e => (e.target as HTMLInputElement).files[0]));
  }

  generateFilename(nameParts: string[], appendTimestamp: boolean = false) {
    const timestampSuffix = appendTimestamp
        ? '_' + new Date().toISOString()
            .replace(/[:-]/g, '').replace('T', '-').substr(0, 13)
        : '';
    const sanitizedTitle = nameParts.map(t => t.replace(/[\s\p{P}]/gu, '-').replace(/-+/g, '-')).join('_');
    return `${sanitizedTitle}${timestampSuffix}`;
  }
}
