import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { CommentSettingsService } from '@app/core/services/http/comment-settings.service';
import { CommentSettings } from '@app/core/models/comment-settings';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { FlexModule } from '@angular/flex-layout';
import { SettingsSlideToggleComponent } from '@app/standalone/settings-slide-toggle/settings-slide-toggle.component';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { ExtensionPointComponent } from '@projects/extension-point/src/lib/extension-point.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatChipGrid,
  MatChipRow,
  MatChipRemove,
  MatChipInput,
} from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { RoomSettingsService } from '@app/core/services/http/room-settings.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnnounceService } from '@app/core/services/util/announce.service';

@Component({
  selector: 'app-comment-settings',
  templateUrl: './comment-settings.component.html',
  styleUrls: ['./comment-settings.component.scss'],
  imports: [
    LoadingIndicatorComponent,
    FlexModule,
    SettingsSlideToggleComponent,
    MatSlider,
    MatSliderThumb,
    FormsModule,
    ExtensionPointComponent,
    MatFormField,
    MatLabel,
    MatChipGrid,
    MatChipRow,
    MatIcon,
    MatChipRemove,
    MatChipInput,
    TranslocoPipe,
  ],
})
export class CommentSettingsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslocoService);
  private commentSettingsService = inject(CommentSettingsService);
  private announceService = inject(AnnounceService);
  private roomSettingsService = inject(RoomSettingsService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) roomId!: string;

  threshold = -50;
  enableThreshold = false;
  settings = new CommentSettings();
  tags: string[] = [];
  timestamp = new Date();
  tagName = '';
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  isLoading = true;

  ngOnInit() {
    this.roomSettingsService
      .getByRoomId(this.roomId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings) => {
        this.enableThreshold = settings.commentThresholdEnabled;
        if (settings.commentThreshold) {
          this.threshold = settings.commentThreshold;
        }
        if (settings.commentTags) {
          this.tags = settings.commentTags;
        }
      });
    this.commentSettingsService.get(this.roomId).subscribe((settings) => {
      this.settings = settings;
      this.isLoading = false;
    });
  }

  addTag() {
    if (this.tagName.length > 0) {
      if (this.checkIfTagExists()) {
        const msg = this.translationService.translate(
          'creator.settings.tag-error'
        );
        this.notificationService.showAdvanced(
          msg,
          AdvancedSnackBarTypes.WARNING
        );
      } else {
        this.tags.push(this.tagName);
        this.tagName = '';
        this.updateTags(true);
      }
    }
  }

  checkIfTagExists(): boolean {
    return this.tags.indexOf(this.tagName.trim()) > -1;
  }

  deleteTag(tag: string) {
    this.tags = this.tags.filter((o) => o !== tag);
    this.updateTags(false);
  }

  updateThresholdEnabled(thresholdEnabled: boolean) {
    this.roomSettingsService
      .updateCommentThresholdEnabled(this.roomId, thresholdEnabled)
      .subscribe((settings) => {
        this.enableThreshold = settings.commentThresholdEnabled!;
        if (this.enableThreshold) {
          this.threshold = settings.commentThreshold;
        }
      });
  }

  updateThreshold() {
    this.roomSettingsService
      .updateCommentThreshold(this.roomId, this.threshold)
      .subscribe((settings) => {
        this.threshold = settings.commentThreshold;
        this.announceService.announce(
          'creator.settings.a11y-threshold-changed',
          {
            value: this.threshold,
          }
        );
      });
  }

  updateTags(addedTag: boolean) {
    this.roomSettingsService
      .updateCommentTags(this.roomId, this.tags)
      .subscribe((settings) => {
        if (settings.commentTags) {
          this.tags = settings.commentTags;
          const msg = this.translationService.translate(
            addedTag
              ? 'creator.settings.tag-added'
              : 'creator.settings.tag-removed'
          );
          this.notificationService.showAdvanced(
            msg,
            addedTag
              ? AdvancedSnackBarTypes.SUCCESS
              : AdvancedSnackBarTypes.WARNING
          );
        }
      });
  }

  updateCommentSettings(change: Partial<CommentSettings> = {}) {
    const commentSettings = new CommentSettings(
      this.roomId,
      change.directSend ?? this.settings.directSend,
      this.settings.fileUploadEnabled,
      change.disabled ?? this.settings.disabled,
      this.settings.readonly
    );
    this.commentSettingsService
      .update(commentSettings)
      .subscribe((settings) => {
        this.settings = settings;
      });
  }

  updateFileUploadEnabled(fileUploadEnabled: boolean) {
    this.settings.fileUploadEnabled = fileUploadEnabled;
    this.updateCommentSettings();
  }
}
