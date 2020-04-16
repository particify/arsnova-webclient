import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';
import { CommentService } from '../services/http/comment.service';

@Injectable()
export class CommentResolver implements Resolve<Comment> {

  constructor(
		private commentService: CommentService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Comment> {
    return this.commentService.getComment(route.params['commentId']);
  }
}
