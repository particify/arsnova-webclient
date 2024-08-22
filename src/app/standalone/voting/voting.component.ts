import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Vote } from '@app/core/models/vote';
import { VoteService } from '@app/core/services/http/vote.service';
import { provideTranslocoScope } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [CoreModule],
  providers: [provideTranslocoScope('participant')],
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
})
export class VotingComponent {
  @Input() score?: number;
  @Input({ required: true }) userId!: string;
  @Input({ required: true }) roomId!: string;
  @Input({ required: true }) commentId!: string;
  @Input()
  set parseVote(vote: Vote) {
    if (vote.vote !== 0) {
      this.currentVote = vote.vote;
    }
  }

  currentVote?: number;
  currentVoteString = '';

  constructor(private voteService: VoteService) {}

  voteComment(vote: number) {
    const voteString = vote.toString();
    let subscription;
    if (this.currentVote !== vote) {
      if (vote === 1) {
        subscription = this.voteService.voteUp(
          this.roomId,
          this.commentId,
          this.userId
        );
      } else {
        subscription = this.voteService.voteDown(
          this.roomId,
          this.commentId,
          this.userId
        );
      }
      this.currentVote = vote;
      this.currentVoteString = voteString;
    } else {
      subscription = this.voteService.deleteVote(
        this.roomId,
        this.commentId,
        this.userId
      );
      this.currentVote = 0;
      this.currentVoteString = '0';
    }
    subscription.subscribe(() => {
      this.resetVotingAnimation();
    });
  }

  resetVotingAnimation() {
    setTimeout(() => {
      this.currentVoteString = '';
    }, 1000);
  }
}
