import { Page, Response } from '@playwright/test';

/** The next successful response to a GraphQL operation of that name. */
export function waitForOperation(
  page: Page,
  operationName: string | RegExp
): Promise<Response> {
  return page.waitForResponse((res) => {
    if (!res.url().includes('/api/graphql') || !res.ok()) {
      return false;
    }
    let name: unknown;
    try {
      name = res.request().postDataJSON()?.operationName;
    } catch {
      return false;
    }
    return typeof name === 'string' && typeof operationName === 'string'
      ? name === operationName
      : typeof name === 'string' && (operationName as RegExp).test(name);
  });
}
