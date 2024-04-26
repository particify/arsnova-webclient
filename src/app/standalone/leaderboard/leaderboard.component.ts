import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';

@Component({
  standalone: true,
  imports: [CoreModule],
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  @Input({ required: true }) leaderboardItems: LeaderboardItem[] = [];
  @Input() aliasId?: string;
}
