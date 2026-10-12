import { Component, inject, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GlobalStorageService,
  STORAGE_KEYS,
} from '@app/core/services/util/global-storage.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { TextOverflowClipComponent } from '@app/standalone/text-overflow-clip/text-overflow-clip.component';
import {
  TranslocoModule,
  TranslocoService,
  provideTranslocoScope,
} from '@jsverse/transloco';
import { QuestionnaireInfoComponent } from '@app/standalone/questionnaire-info/questionnaire-info.component';
import {
  QuestionnaireSummaryFragment,
  ToggleQuestionnairePublishedGql,
} from '@gql/generated/graphql';
import { mutationHelper } from '@gql/helper/mutation-helper';

@Component({
  imports: [
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    FlexModule,
    TranslocoModule,
    TextOverflowClipComponent,
    MatButtonModule,
    MatRippleModule,
    QuestionnaireInfoComponent,
  ],
  providers: [provideTranslocoScope('creator')],
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
})
export class QuestionnaireComponent {
  private readonly router = inject(Router);
  private readonly globalStorageService = inject(GlobalStorageService);
  private readonly route = inject(ActivatedRoute);
  private readonly translateService = inject(TranslocoService);
  private readonly notificationService = inject(NotificationService);
  private readonly mutations = mutationHelper();
  private readonly toggleQuestionnairePublished = inject(
    ToggleQuestionnairePublishedGql
  );

  readonly questionnaire = input.required<QuestionnaireSummaryFragment>();
  readonly isParticipant = input<boolean>(false);
  readonly showRipple = input<boolean>(false);

  viewContents() {
    this.router.navigate(['.', 'questionnaire', this.questionnaire().id], {
      relativeTo: this.route,
    });
    this.globalStorageService.setItem(
      STORAGE_KEYS.LAST_GROUP,
      this.questionnaire().id
    );
  }

  togglePublishing(): void {
    const published = !this.questionnaire().published;
    this.toggleQuestionnairePublished
      .mutate({ variables: { id: this.questionnaire().id, published } })
      .pipe(this.mutations.handleErrors())
      .subscribe({
        next: () => {
          const msg = this.translateService.translate(
            published
              ? 'creator.content.group-published'
              : 'creator.content.group-locked'
          );
          this.notificationService.showAdvanced(
            msg,
            published
              ? AdvancedSnackBarTypes.SUCCESS
              : AdvancedSnackBarTypes.WARNING
          );
        },
      });
  }
}
