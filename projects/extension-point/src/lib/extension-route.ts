import { Route } from '@angular/router';

/**
 * Defines which original routing module should handle mounting of routes.
 */
export enum RouteMountPoint {
  ROOT,
  CREATOR,
  MODERATOR,
  PARTICIPANT
}

/**
 * This provider allows the definition of additional routes outside of the
 * original routing modules. It defines new routes for a single
 * `RouteMountPoint`.
 *
 * Usage:
 * ```
 * @NgModule({
 *   // ...
 *   providers: [
 *     {
 *       provide: ExtensionRouteProvider,
 *       useFactory: () => new ExtensionRouteProvider(
 *         RouteMountPoint.CREATOR, [
 *         {
 *           path: 'some/extension/path',
 *           component: SomeExtensionComponent
 *         }
 *       ]),
 *       multi: true
 *     }
 *   ]
 * })
 * export class SomeExtensionModule {
 * }
 * ```
 */
export class ExtensionRouteProvider {
  constructor(
    public readonly mountPoint: RouteMountPoint,
    public readonly routes: Route[]
  ) { }

  static extractRoutesForMountPoint(
    mountPoint: RouteMountPoint,
    extensionRouteProviders: ExtensionRouteProvider[]
  ): Route[] {
    return extensionRouteProviders.filter(p => p.mountPoint === mountPoint).reduce((acc, cur) => acc.concat(cur.routes), <Route[]>[]);
  }
}
