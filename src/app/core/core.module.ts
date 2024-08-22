import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { HotkeyDirective } from './directives/hotkey.directive';
import { TrackInteractionDirective } from './directives/track-interaction.directive';
import { A11yIntroPipe } from './pipes/a11y-intro.pipe';
import { A11yRenderedBodyPipe } from './pipes/a11y-rendered-body.pipe';
import { CounterBracesPipe } from './pipes/counter-braces.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { DateFromNowPipe } from './pipes/date-from-now.pipe';
import { SplitShortIdPipe } from './pipes/split-short-id.pipe';
import { FeatureFlagDirective } from '@app/core/directives/feature-flag.directive';
import { AutofocusDirective } from './directives/autofocus.directive';
import { DisableFormDirective } from './directives/disable-form.directive';
import { TemplateService } from '@app/creator/_services/template.service';
import { LocalizeDecimalSeperatorPipe } from '@app/core/pipes/localize-decimal-seperator.pipe';
import { DurationPipe } from '@app/core/pipes/duration.pipe';

@NgModule({
  declarations: [
    // Pipes
    SplitShortIdPipe,
    CounterBracesPipe,
    A11yIntroPipe,
    DateFromNowPipe,
    DateFormatPipe,
    A11yRenderedBodyPipe,
    LocalizeDecimalSeperatorPipe,
    DurationPipe,

    // Directives
    HotkeyDirective,
    TrackInteractionDirective,
    FeatureFlagDirective,
    AutofocusDirective,
    DisableFormDirective,
  ],
  exports: [
    // Angular
    CommonModule,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSidenavModule,
    MatRippleModule,

    // Pipes
    SplitShortIdPipe,
    CounterBracesPipe,
    A11yIntroPipe,
    DateFromNowPipe,
    DateFormatPipe,
    A11yRenderedBodyPipe,
    LocalizeDecimalSeperatorPipe,
    DurationPipe,

    // Directives
    HotkeyDirective,
    TrackInteractionDirective,
    FeatureFlagDirective,
    AutofocusDirective,
    DisableFormDirective,

    // 3rd party
    TranslocoModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { hideRequiredMarker: true },
    },
    TemplateService,
  ],
})
export class CoreModule {}
