import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ContentGroup, PublishingMode } from '@app/core/models/content-group';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    FlexModule,
    TranslocoModule,
    ListBadgeComponent,
    TextOverflowClipComponent,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss'],
})
export class ContentGroupsComponent {
  @Input({ required: true }) contentGroup!: ContentGroup;
  @Input({ required: true }) role!: UserRole;
  @Input({ required: true }) shortId!: string;

  constructor(
    private router: Router,
    private globalStorageService: GlobalStorageService,
    private contentPublishService: ContentPublishService,
    private routingService: RoutingService
  ) {}

  viewContents() {
    this.router.navigate([
      this.routingService.getRoleRoute(this.role),
      this.shortId,
      'series',
      this.contentGroup.name,
    ]);
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.contentGroup.name
    );
  }

  isLocked(): boolean {
    return this.contentGroup.publishingMode === PublishingMode.NONE;
  }

  getLength(): number {
    if (!this.contentGroup.contentIds) {
      return 0;
    }
    if (this.role === UserRole.PARTICIPANT) {
      return this.contentPublishService.filterPublishedIds(this.contentGroup)
        .length;
    }
    return this.contentGroup.contentIds.length;
  }
}
