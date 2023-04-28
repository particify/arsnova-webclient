import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Comment } from '@app/core/models/comment';
import { CommentService } from '@app/core/services/http/comment.service';
import { RoomService } from '@app/core/services/http/room.service';

@Injectable()
export class CommentResolver implements Resolve<Comment> {
  constructor(
    private roomService: RoomService,
    private commentService: CommentService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Comment> {
    return this.roomService.getRoomByShortId(route.params['shortId']).pipe(
      mergeMap((room) => {
        return this.commentService.getComment(
          route.params['commentId'],
          room.id
        );
      })
    );
  }
}
