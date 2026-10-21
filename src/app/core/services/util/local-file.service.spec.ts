import { TestBed, fakeAsync, flush } from '@angular/core/testing';
import { config, of, throwError } from 'rxjs';
import { LocalFileService } from './local-file.service';

describe('LocalFileService', () => {
  let service: LocalFileService;
  let save: jasmine.Spy;
  let onUnhandledError: jasmine.Spy;
  const originalOnUnhandledError = config.onUnhandledError;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LocalFileService] });
    service = TestBed.inject(LocalFileService);
    save = spyOn(service, 'save');
    onUnhandledError = jasmine.createSpy('onUnhandledError');
    config.onUnhandledError = onUnhandledError;
  });

  afterEach(() => {
    config.onUnhandledError = originalOnUnhandledError;
  });

  it('saves the downloaded file under the given name', () => {
    const blob = new Blob(['format,body']);

    service.download(of(blob), 'contents.csv');

    expect(save).toHaveBeenCalledOnceWith(blob, 'contents.csv');
  });

  it('leaves a failed download to its producer', fakeAsync(() => {
    service.download(
      throwError(() => new Error('500')),
      'contents.csv'
    );
    // RxJS reports an unhandled error asynchronously.
    flush();

    expect(save).not.toHaveBeenCalled();
    expect(onUnhandledError).not.toHaveBeenCalled();
  }));
});
