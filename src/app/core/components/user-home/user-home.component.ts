import { Component, OnInit, inject, input } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { AutofocusDirective } from '@app/core/directives/autofocus.directive';
import { RoomListComponent } from '@app/core/components/room-list/room-list.component';
import { AsyncPipe } from '@angular/common';
import { A11yIntroPipe } from '@app/core/pipes/a11y-intro.pipe';
import { DialogService } from '@app/core/services/util/dialog.service';
import { Router } from '@angular/router';
import { GlobalHintsService } from '@app/standalone/global-hints/global-hints.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
  imports: [
    FlexModule,
    AutofocusDirective,
    RoomListComponent,
    AsyncPipe,
    A11yIntroPipe,
  ],
})
export class UserHomeComponent implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly globalHintsService = inject(GlobalHintsService);

  startVerification = input<boolean>(false);

  ngOnInit() {
    if (this.startVerification()) {
      this.router.navigate(['user'], { replaceUrl: true });
      this.dialogService
        .openUserActivationDialog(true)
        .afterClosed()
        .subscribe((result?: { success: boolean }) => {
          if (result?.success) {
            this.globalHintsService.removeHint('verify-hint');
          }
        });
    }
  }
}
