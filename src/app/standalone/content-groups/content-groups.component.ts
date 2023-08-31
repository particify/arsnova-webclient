import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { UserRole } from '@app/core/models/user-roles.enum';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import { RoutingService } from '@app/core/services/util/routing.service';
import { ListBadgeComponent } from '@app/standalone/list-badge/list-badge.component';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    FlexModule,
    TranslocoModule,
    ListBadgeComponent,
  ],
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss'],
})
export class ContentGroupsComponent {
  @Input() contentGroupName: string;
  @Input() length: number;
  @Input() isLocked = false;
  @Input() role: UserRole;
  @Input() shortId: string;

  constructor(
    private router: Router,
    private globalStorageService: GlobalStorageService,
    private routingService: RoutingService
  ) {}

  viewContents() {
    this.router.navigate([
      this.routingService.getRoleRoute(this.role),
      this.shortId,
      'series',
      this.contentGroupName,
    ]);
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.contentGroupName
    );
  }
}
