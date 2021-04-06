import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { LOADING_ICON, SnackBarAdvancedComponent } from '../../components/shared/snack-bar-advanced/snack-bar-advanced.component';

export enum AdvancedSnackBarTypes {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
  LOADING = 'LOADING'
}

@Injectable()
export class NotificationService {
  public snackRef: any;

  constructor(public snackBar: MatSnackBar) {
  }

  show(message: string, action?: string, config?: MatSnackBarConfig) {
    const defaultConfig: MatSnackBarConfig = {
      duration: (action ? 25000 : 5000),
      panelClass: ['snackbar']
    };

    // Delegate the message and merge the (optionally) passed config with the default config
    this.snackRef = this.snackBar.open(message, action, Object.assign({}, defaultConfig, config));
  }

  showAdvanced(message: string, type: AdvancedSnackBarTypes): MatSnackBarRef<SnackBarAdvancedComponent> {
    let duration = 2500;
    let typeString: string;
    switch (type) {
      case AdvancedSnackBarTypes.SUCCESS:
        typeString = 'done';
        break;
      case AdvancedSnackBarTypes.FAILED:
        typeString = 'close';
        duration = 4000;
        break;
      case AdvancedSnackBarTypes.WARNING:
        typeString = 'warning';
        break;
      case AdvancedSnackBarTypes.LOADING:
        typeString = LOADING_ICON;
        duration = 0;
        break;
    }
    this.snackRef = this.snackBar.openFromComponent(SnackBarAdvancedComponent, {
      data: {
        message: message,
        icon: typeString
      },
      duration: duration
    });
    return this.snackRef;
  }
}
