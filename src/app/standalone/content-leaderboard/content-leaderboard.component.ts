import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { CurrentLeaderboardItem } from '@app/core/models/current-leaderboard-item';
import { OrdinalPipe } from '@app/core/pipes/ordinal.pipe';

@Component({
  standalone: true,
  imports: [CoreModule, OrdinalPipe],
  selector: 'app-content-leaderboard',
  templateUrl: './content-leaderboard.component.html',
  styleUrl: './content-leaderboard.component.scss',
})
export class ContentLeaderboardComponent {
  @Input({ required: true }) leaderboardItems: CurrentLeaderboardItem[] = [];
  @Input({ required: true }) aliasId!: string;
  @Input() showDuration = true;
}
