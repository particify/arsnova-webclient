import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-entity-link',
  imports: [CommonModule, RouterLink, FlexModule],
  templateUrl: './admin-entity-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEntityLinkComponent {
  entityName = input.required<string>();
  entityId = input.required<string>();
}
