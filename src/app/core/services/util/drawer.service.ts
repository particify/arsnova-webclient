import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private drawer?: MatDrawer;

  setDrawer(drawer?: MatDrawer): void {
    this.drawer = drawer;
  }

  toggleDrawer(): void {
    this.drawer?.toggle();
  }
}
