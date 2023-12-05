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
import { TranslocoModule, provideTranslocoScope } from '@ngneat/transloco';

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
  providers: [provideTranslocoScope('creator')],
  selector: 'app-content-groups',
  templateUrl: './content-groups.component.html',
  styleUrls: ['./content-groups.component.scss'],
})
export class ContentGroupsComponent {
  @Input({ required: true }) contentGroupName!: string;
  @Input({ required: true }) length!: number;
  @Input({ required: true }) role!: UserRole;
  @Input({ required: true }) shortId!: string;
  @Input() isLocked = false;

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
