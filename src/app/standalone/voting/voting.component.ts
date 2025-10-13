import {
  ChangeDetectionStrategy,
  Component,
  input,
  Pipe,
  PipeTransform,
  inject,
  signal,
} from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { VoteQnaPostGql } from '@gql/generated/graphql';
import { provideTranslocoScope } from '@jsverse/transloco';

@Pipe({ name: 'voteAction', pure: true, standalone: true })
export class VoteAction implements PipeTransform {
  transform(vote: number | undefined, direction: string): string {
    const base = 'participant.comment-page.';
    const action =
      vote === (direction === 'up' ? 1 : -1)
        ? 'withdraw-' + direction + 'vote'
        : 'vote-' + direction;
    return base + action;
  }
}

@Component({
  imports: [CoreModule, VoteAction],
  providers: [provideTranslocoScope('participant')],
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VotingComponent {
  private readonly votePost = inject(VoteQnaPostGql);

  readonly score = input<number | undefined>(0);
  readonly postId = input.required<string>();
  readonly userVote = input<number | undefined>(0);

  userVoteString = signal('');

  voteComment(vote: number) {
    this.userVoteString.set((this.userVote() !== vote ? vote : 0).toString());
    this.votePost
      .mutate({ variables: { postId: this.postId(), value: vote } })
      .subscribe({
        next: () => {
          setTimeout(() => {
            this.userVoteString.set('');
          }, 1000);
        },
      });
  }
}
