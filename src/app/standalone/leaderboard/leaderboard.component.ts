import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { LeaderboardItem } from '@app/core/models/leaderboard-item';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';

@Component({
  standalone: true,
  imports: [CoreModule, OrdinalPipe],
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
})
export class LeaderboardComponent {
  @Input({ required: true }) leaderboardItems: LeaderboardItem[] = [];
  @Input() aliasId?: string;
}
