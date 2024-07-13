import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ContentGroup } from '@app/core/models/content-group';
import { UserRole } from '@app/core/models/user-roles.enum';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { ContentPublishService } from '@app/core/services/util/content-publish.service';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ContentGroupInfoComponent } from '@app/standalone/content-group-info/content-group-info.component';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import {
  TranslocoModule,
  TranslocoService,
  provideTranslocoScope,
} from '@ngneat/transloco';

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
    ContentGroupInfoComponent,
    CommonModule,
    MatButtonModule,
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
    private routingService: RoutingService,
    private contentGroupService: ContentGroupService,
    private translateService: TranslocoService,
    private notificationService: NotificationService,
    private contentPublishService: ContentPublishService
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
    return this.contentPublishService.isGroupLocked(this.contentGroup);
  }

  togglePublishing(): void {
    const changes = {
      published: !this.contentGroup.published,
    };
    this.contentGroupService
      .patchContentGroup(this.contentGroup, changes)
      .subscribe((group) => {
        this.contentGroup = group;
        if (this.isLocked()) {
          const msg = this.translateService.translate(
            'creator.content.group-locked'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.WARNING
          );
        } else {
          const msg = this.translateService.translate(
            'creator.content.group-published'
          );
          this.notificationService.showAdvanced(
            msg,
            AdvancedSnackBarTypes.SUCCESS
          );
        }
      });
  }

  isParticipant(): boolean {
    return this.role === UserRole.PARTICIPANT;
  }
}
