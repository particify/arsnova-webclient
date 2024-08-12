import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ContentGroup } from '@app/core/models/content-group';
import { TranslocoRootModule } from '@app/transloco-root.module';
import { MatIconModule } from '@angular/material/icon';
import { provideTranslocoScope } from '@ngneat/transloco';

@Component({
  selector: 'app-content-group-info',
  standalone: true,
  imports: [TranslocoRootModule, CommonModule, FlexModule, MatIconModule],
  providers: [provideTranslocoScope('creator')],
  templateUrl: './content-group-info.component.html',
  styleUrl: './content-group-info.component.scss',
})
export class ContentGroupInfoComponent {
  @Input({ required: true }) contentGroup!: ContentGroup;
}
