import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  drawerOpen$ = new Subject<boolean>();
  drawerExists$ = new Subject<boolean>();
  private drawer?: MatDrawer;

  constructor() {}

  setDrawer(drawer?: MatDrawer): void {
    this.drawer = drawer;
    this.drawerExists$.next(!!this.drawer);
    this.drawer?.openedStart.subscribe(() => {
      this.drawerOpen$.next(true);
    });
    this.drawer?.closedStart.subscribe(() => {
      this.drawerOpen$.next(false);
    });
  }

  toggleDrawer(): void {
    this.drawer?.toggle();
  }
}
