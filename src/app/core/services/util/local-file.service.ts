import { Injectable } from '@angular/core';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';

@Injectable()
export class LocalFileService {
  save(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.click();
  }

  /** Saves the emitted file; its producer reports a failure itself. */
  download(data: Observable<Blob>, filename: string) {
    data
      .pipe(catchError(() => EMPTY))
      .subscribe((blob) => this.save(blob, filename));
  }

  upload(accept?: string[]): Observable<Blob | null> {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) {
      input.setAttribute('accept', accept.join(','));
    }
    input.click();
    const fileChanged = fromEvent(input, 'change');
    return fileChanged.pipe(
      filter((e) => !!(e.target as HTMLInputElement).files),
      map((e) => ((e.target as HTMLInputElement).files as FileList).item(0))
    );
  }

  generateFilename(nameParts: string[], appendTimestamp = false) {
    const timestampSuffix = appendTimestamp
      ? '_' +
        new Date()
          .toISOString()
          .replace(/[:-]/g, '')
          .replace('T', '-')
          .substr(0, 13)
      : '';
    const sanitizedTitle = nameParts
      .map((t) => t.replace(/[\s\p{P}]/gu, '-').replace(/-+/g, '-'))
      .join('_');
    return `${sanitizedTitle}${timestampSuffix}`;
  }
}
