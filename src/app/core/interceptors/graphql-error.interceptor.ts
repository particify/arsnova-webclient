import { Injectable, inject } from '@angular/core';
import {
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { tap } from 'rxjs';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { EventService } from '@app/core/services/util/event.service';
import { GraphqlError } from '@app/core/models/events/graphql-error';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';

@Injectable()
export class GraphqlErrorInterceptor implements HttpInterceptor {
  private readonly eventService = inject(EventService);
  private readonly globalStorageService = inject(GlobalStorageService);
  private count = 0;

  constructor() {
    const count = this.globalStorageService.getItem(
      STORAGE_KEYS.GRAPHQL_ERROR_COUNT
    );
    if (!isNaN(count)) {
      this.count = count;
    }
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    return req.url === '/api/graphql'
      ? next.handle(req).pipe(
          tap((e) => {
            if (
              e.type !== HttpEventType.Response ||
              e.status !== HttpStatusCode.Ok
            ) {
              // GraphQL errors don't have an HTTP error status.
              return;
            }
            if (Array.isArray(e.body?.errors) && e.body.errors.length > 0) {
              const classification = e.body.errors[0].extensions?.[
                'classification'
              ] as ErrorClassification | undefined;
              const event = new GraphqlError(
                this.incrementErrorCount(),
                classification
              );
              this.eventService.broadcast(event.type, event.payload);
            }
          })
        )
      : next.handle(req);
  }

  incrementErrorCount(): number {
    this.globalStorageService.setItem(
      STORAGE_KEYS.GRAPHQL_ERROR_COUNT,
      ++this.count
    );
    return this.count;
  }
}
