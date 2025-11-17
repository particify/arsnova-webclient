import { inject } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
} from '@angular/router';
import { filter, first } from 'rxjs';

export const hideSplashscreenInitializer = () => {
  const router = inject(Router);
  router.events
    .pipe(
      filter(
        (event) =>
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
      ),
      first()
    )
    .subscribe(() => hideSplashScreen());

  function hideSplashScreen() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
      }, 200);
    }
  }
};
