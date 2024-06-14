import { Component, Input } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { RoomUserAlias } from '@app/core/models/room-user-alias';
import { AuthenticationService } from '@app/core/services/http/authentication.service';
import { RoomUserAliasService } from '@app/core/services/http/room-user-alias.service';
import { FormService } from '@app/core/services/util/form.service';
import { ContentStepInfoComponent } from '@app/standalone/content-step-info/content-step-info.component';
import { FormComponent } from '@app/standalone/form/form.component';
import { LoadingButtonComponent } from '@app/standalone/loading-button/loading-button.component';

@Component({
  selector: 'app-content-waiting',
  standalone: true,
  imports: [CoreModule, ContentStepInfoComponent, LoadingButtonComponent],
  templateUrl: './content-waiting.component.html',
  styleUrl: './content-waiting.component.scss',
})
export class ContentWaitingComponent extends FormComponent {
  @Input({ required: true }) current!: number;
  @Input({ required: true }) totalCount!: number;
  @Input({ required: true }) alias?: RoomUserAlias;
  @Input({ required: true }) roomId!: string;

  enteredAlias = '';

  constructor(
    protected formService: FormService,
    private roomUserAliasService: RoomUserAliasService,
    private authService: AuthenticationService
  ) {
    super(formService);
  }

  setAlias(): void {
    this.disableForm();
    const changes = this.enteredAlias
      ? { alias: this.enteredAlias }
      : { seed: this.alias?.seed };
    this.authService.getCurrentAuthentication().subscribe((auth) => {
      this.roomUserAliasService
        .updateAlias(this.roomId, auth.userId, changes)
        .subscribe((alias) => {
          if (this.alias) {
            this.alias.id = alias.id;
            if (this.enteredAlias) {
              this.alias.alias = this.enteredAlias;
            }
          }
        });
    });
  }

  generateAlias(): void {
    this.roomUserAliasService.generateAlias(this.roomId).subscribe((alias) => {
      this.alias = alias;
    });
  }
}
