import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { IAppConfig } from '@app/core/models/app-config.model';

@Injectable()
export class AppConfig {
  private http = inject(HttpClient);

  static settings: IAppConfig;

  load() {
    const jsonFile = `assets/config/config.${environment.name}.json`;
    return new Promise<void>((resolve, reject) => {
      this.http
        .get<IAppConfig>(jsonFile)
        .toPromise()
        .then((response) => {
          if (response) {
            AppConfig.settings = response;
          }
          resolve();
        })
        .catch((response: any) => {
          reject(
            `Could not load file '${jsonFile}': ${JSON.stringify(response)}`
          );
        });
    });
  }
}
