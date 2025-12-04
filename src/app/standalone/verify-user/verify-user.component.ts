import { HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { FormHeaderComponent } from '@app/core/components/form-header/form-header.component';
import { ChallengeService } from '@app/core/services/challenge.service';
import {
  AdvancedSnackBarTypes,
  NotificationService,
} from '@app/core/services/util/notification.service';
import { FormComponent } from '@app/standalone/form/form.component';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';
import { VerifyUserMailAddressUnauthenticatedGql } from '@gql/generated/graphql';
import { ErrorClassification } from '@gql/helper/handle-operation-error';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { first, switchMap } from 'rxjs';

const EXPIRES_FALLBACK_OFFSET = 3600;

@Component({
  imports: [
    FlexLayoutModule,
    FormHeaderComponent,
    HintComponent,
    LoadingButtonComponent,
    MatCard,
    TranslocoPipe,
  ],
  templateUrl: 'verify-user.component.html',
})
export class VerifyUserComponent extends FormComponent {
  private readonly challengeService = inject(ChallengeService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslocoService);
  private readonly verifyGql = inject(VerifyUserMailAddressUnauthenticatedGql);
  readonly userId = input.required<string>();
  readonly code = input.required<string>();
  readonly expires = input<number>(
    new Date().getTime() / 1000 + EXPIRES_FALLBACK_OFFSET
  );
  readonly expired = computed(
    () => this.expires() <= new Date().getTime() / 1000
  );

  verify(): void {
    this.disableForm();
    this.challengeService
      .authenticateByChallenge()
      .pipe(
        first(),
        switchMap((t) => {
          return this.verifyGql.mutate({
            variables: {
              verificationCode: this.code(),
              userId: this.userId(),
            },
            context: {
              headers: new HttpHeaders({ Authorization: `Bearer ${t}` }),
            },
          });
        })
      )
      .subscribe({
        complete: () => this.enableForm(),
        next: (r) => {
          if (r.data?.verifyUserMailAddressUnauthenticated) {
            this.router.navigate(['login']);
            this.notificationService.showAdvanced(
              this.translationService.translate(
                'user-activation.verification-successful'
              ),
              AdvancedSnackBarTypes.SUCCESS
            );
          }
        },
        error: (e) => {
          this.enableForm();
          this.notificationService.showOnRequestClientError(e, {
            [ErrorClassification.BadRequest]: {
              message: this.translationService.translate(
                'user-activation.verification-failed'
              ),
              type: AdvancedSnackBarTypes.FAILED,
            },
          });
        },
      });
  }
}
