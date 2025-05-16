import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { GroupType } from '@app/core/models/content-group';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { MatIconModule } from '@angular/material/icon';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-content-group-info',
  imports: [
    TranslocoRootModule,
    CommonModule,
    FlexModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-group-info.component.html',
  styleUrl: './content-group-info.component.scss',
})
export class ContentGroupInfoComponent {
  private contentGroupService = inject(ContentGroupService);

  @Input() groupType?: GroupType;
  @Input() contentCount?: number;
  @Input() published = true;
  @Input() countColor = false;

  GroupType = GroupType;
  typeIcons: Map<GroupType, string>;

  constructor() {
    const contentGroupService = this.contentGroupService;

    this.typeIcons = contentGroupService.getTypeIcons();
  }
}
