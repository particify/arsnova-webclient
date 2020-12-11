import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiConfig } from '../models/api-config';
import { ApiConfigService } from '../services/http/api-config.service';

@Injectable()
export class ApiConfigResolver implements Resolve<ApiConfig> {
  constructor(
    private apiConfigService: ApiConfigService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ApiConfig> {
    return this.apiConfigService.getApiConfig$();
  }
}
