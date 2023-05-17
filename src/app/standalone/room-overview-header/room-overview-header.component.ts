import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { RoutingService } from '@app/core/services/util/routing.service';
import { CopyUrlComponent } from '@app/standalone/copy-url/copy-url.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';

@Component({
  standalone: true,
  imports: [CoreModule, CopyUrlComponent, RenderedTextComponent],
  selector: 'app-room-overview-header',
  templateUrl: './room-overview-header.component.html',
  styleUrls: ['./room-overview-header.component.scss'],
})
export class RoomOverviewHeaderComponent implements OnInit {
  @Input() name: string;
  @Input() shortId: string;
  @Input() description: string;
  @Input() renderedDescription: string;

  roomJoinUrl: string;

  constructor(
    private routingService: RoutingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.roomJoinUrl = this.routingService.getRoomJoinUrl(
      this.route.snapshot.data.apiConfig.ui.links?.join?.url
    );
  }
}
