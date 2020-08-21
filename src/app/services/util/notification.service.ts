import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackBarAdvancedComponent } from '../../components/shared/snack-bar-advanced/snack-bar-advanced.component';

export enum AdvancedSnackBarTypes {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  WARNING = 'WARNING'
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

  showAdvanced(message: string, type: string) {
    let typeString: string;
    switch (type) {
      case AdvancedSnackBarTypes.SUCCESS:
        typeString = 'done';
        break;
      case AdvancedSnackBarTypes.FAILED:
        typeString = 'close';
        break;
      case AdvancedSnackBarTypes.WARNING:
        typeString = 'warning';
    }
    this.snackRef = this.snackBar.openFromComponent(SnackBarAdvancedComponent, {
      data: {
        message: message,
        icon: typeString
      },
      duration: type === AdvancedSnackBarTypes.FAILED ? 4000 : 2500
    });
  }
}
