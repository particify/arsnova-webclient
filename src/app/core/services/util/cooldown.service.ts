import { Injectable, inject, signal } from '@angular/core';
import { GlobalStorageService, STORAGE_KEYS } from './global-storage.service';

const RESEND_COOLDOWN_SECONDS = 90;

@Injectable({ providedIn: 'root' })
export class CooldownService {
  private readonly globalStorageService = inject(GlobalStorageService);

  private resendCooldownInterval?: ReturnType<typeof setInterval>;
  readonly resendCooldownSeconds = signal(0);

  startResendCooldown(cooldown = RESEND_COOLDOWN_SECONDS) {
    this.resendCooldownSeconds.set(cooldown);
    const cooldownExpiration =
      new Date().getTime() + this.resendCooldownSeconds() * 1000;
    this.globalStorageService.setItem(
      STORAGE_KEYS.VERIFICATION_COOLDOWN_EXPIRATION,
      cooldownExpiration
    );
    this.resendCooldownInterval = setInterval(() => {
      this.resendCooldownSeconds.update((c) => c - 1);
      if (this.resendCooldownSeconds() <= 0) {
        clearInterval(this.resendCooldownInterval);
        this.globalStorageService.removeItem(
          STORAGE_KEYS.VERIFICATION_COOLDOWN_EXPIRATION
        );
      }
    }, 1000);
  }

  continueActiveResendCooldown() {
    const activeCooldown = this.globalStorageService.getItem(
      STORAGE_KEYS.VERIFICATION_COOLDOWN_EXPIRATION
    );
    const currentDate = new Date().getTime();
    if (activeCooldown) {
      if (activeCooldown < currentDate) {
        this.globalStorageService.removeItem(
          STORAGE_KEYS.VERIFICATION_COOLDOWN_EXPIRATION
        );
        return;
      }
      clearInterval(this.resendCooldownInterval);
      this.startResendCooldown(
        Math.round((activeCooldown - currentDate) / 1000)
      );
    }
  }
}
