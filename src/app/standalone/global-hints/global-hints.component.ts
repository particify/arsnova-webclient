import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ApiConfigService } from '@app/core/services/http/api-config.service';
import { HintComponent } from '@app/standalone/hint/hint.component';
import { ExtensionPointComponent } from '@projects/extension-point/src/public-api';
import { map } from 'rxjs';

@Component({
  selector: 'app-global-hints',
  templateUrl: './global-hints.component.html',
  styleUrl: './global-hints.component.scss',
  imports: [HintComponent, ExtensionPointComponent, FlexLayoutModule],
})
export class GlobalHintsComponent {
  private apiConfigService = inject(ApiConfigService);
  readOnlyEnabled = toSignal(
    this.apiConfigService.getApiConfig$().pipe(map((c) => c.readOnly))
  );
}
