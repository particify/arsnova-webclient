import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { Vote } from '@app/core/models/vote';
import { VoteService } from '@app/core/services/http/vote.service';

@Component({
  standalone: true,
  imports: [CoreModule],
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
})
export class VotingComponent {
  @Input() score: number;
  @Input() userId: string;
  @Input() roomId: string;
  @Input() commentId: string;
  @Input()
  set parseVote(vote: Vote) {
    if (vote) {
      this.hasVoted = vote.vote;
    }
  }
  hasVoted = 0;
  currentVote: string;

  constructor(private voteService: VoteService) {}

  vote(vote: number) {
    const voteString = vote.toString();
    let subscription;
    if (this.hasVoted !== vote) {
      if (voteString === '1') {
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
      this.currentVote = voteString;
      this.hasVoted = vote;
    } else {
      subscription = this.voteService.deleteVote(
        this.roomId,
        this.commentId,
        this.userId
      );
      this.hasVoted = 0;
      this.currentVote = '0';
    }
    subscription.subscribe(() => {
      this.resetVotingAnimation();
    });
  }

  resetVotingAnimation() {
    setTimeout(() => {
      this.currentVote = '';
    }, 1000);
  }
}
