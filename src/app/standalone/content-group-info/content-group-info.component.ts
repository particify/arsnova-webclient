import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { GroupType } from '@app/core/models/content-group';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { MatIconModule } from '@angular/material/icon';
import { provideTranslocoScope } from '@jsverse/transloco';
import { ContentGroupService } from '@app/core/services/http/content-group.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-content-group-info',
  standalone: true,
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
  @Input() groupType?: GroupType;
  @Input() contentCount?: number;
  @Input() published = true;

  GroupType = GroupType;
  typeIcons: Map<GroupType, string>;

  constructor(private contentGroupService: ContentGroupService) {
    this.typeIcons = contentGroupService.getTypeIcons();
  }
}
