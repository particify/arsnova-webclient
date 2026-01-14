import { test, expect, chromium } from '@playwright/test';
import { HomePage } from '@e2e/fixtures/shared/home';
import { Header } from '@e2e/fixtures/shared/header';

test.describe('room list', () => {
  let header: Header;
  let homePage: HomePage;
  let shortId: string;

  test.beforeEach(async ({ page, baseURL }) => {
    header = new Header(page);
    homePage = new HomePage(page, baseURL);
    await homePage.goto();
    shortId = await homePage.createRoom('Room 1');
  });

  test.afterEach(async ({ page }) => {
    await header.goToRooms();
    const roomCount = (await page.getByTestId('room-item').all()).length;
    for (let i = 0; i < roomCount; i++) {
      await page.getByTestId('more-room-options-btn-0').click();
      await page.getByRole('menuitem', { name: 'Delete room' }).click();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.waitForResponse(
        (res) =>
          !!res.request().postData()?.includes('RoomMemberships') && res.ok()
      );
    }
  });

  test('open room as creator', async ({ page }) => {
    await header.goToRooms();
    await page.getByTestId('room-item').nth(0).click();
    await expect(page).toHaveURL(/\/edit\//);
    await expect(page).toHaveTitle(/Room 1/);
  });

  test('join room as participant', async ({ baseURL }) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const p = await context.newPage();
    await p.goto(baseURL + '/p/' + shortId);
    const header = new Header(p);
    await header.goToRooms();
    await p.getByTestId('room-item').nth(0).click();
    await expect(p).toHaveURL(/\/p\//);
    await expect(p).toHaveTitle(/Room 1/);
  });

  test('delete room from room list', async ({ page }) => {
    await header.goToRooms();
    await expect(page.getByTestId('room-item').nth(0)).toBeVisible();
    await page.getByTestId('more-room-options-btn-0').click();
    await page.getByRole('menuitem', { name: 'Delete room' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByTestId('room-item').nth(0)).toBeHidden();
  });

  test('cancel room deletion from room list', async ({ page }) => {
    await header.goToRooms();
    await expect(page.getByTestId('room-item').nth(0)).toBeVisible();
    await page.getByTestId('more-room-options-btn-0').click();
    await page.getByRole('menuitem', { name: 'Delete room' }).click();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByTestId('room-item').nth(0)).toBeVisible();
  });

  test('create room and duplicate it', async ({ page }) => {
    await header.goToRooms();
    await expect(page.getByTestId('room-item').nth(0)).toBeVisible();
    await page.getByTestId('more-room-options-btn-0').click();
    await page.getByRole('menuitem', { name: 'Duplicate room' }).click();
    await page
      .getByRole('combobox', { name: 'room name' })
      .fill('My duplicated room');
    await page
      .getByRole('button', { name: 'Create Room', exact: true })
      .click();
    await expect(page.getByTestId('room-item').nth(1)).toBeVisible();
  });

  test('create room and go to settings from room list', async ({ page }) => {
    await header.goToRooms();
    await page.getByTestId('more-room-options-btn-0').click();
    await page.getByRole('menuitem', { name: 'Settings', exact: true }).click();
    await expect(page).toHaveURL(/settings/);
  });

  test('create three rooms and search for them', async ({ page }) => {
    await homePage.goto();
    await homePage.createRoom('Another room');
    await homePage.goto();
    await homePage.createRoom('My awesome room');
    await header.goToRooms();
    await page.waitForURL('user');
    expect(await page.getByTestId('room-item').all()).toHaveLength(3);
    await page.getByPlaceholder('search rooms').fill('awesome');
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('RoomMemberships') && res.ok()
    );
    expect(await page.getByTestId('room-item').all()).toHaveLength(1);
    await page.getByPlaceholder('search rooms').fill('a');
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('RoomMemberships') && res.ok()
    );
    expect(await page.getByTestId('room-item').all()).toHaveLength(2);
    await page.getByPlaceholder('search rooms').clear();
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('RoomMemberships') && res.ok()
    );
    expect(await page.getByTestId('room-item').all()).toHaveLength(3);
  });

  test('create more than 10 rooms and load more in room list', async ({
    page,
  }) => {
    await header.goToRooms();
    await homePage.createRoom('Room 2');
    await page.goBack();
    await homePage.createRoom('Room 3');
    await page.goBack();
    await homePage.createRoom('Room 4');
    await page.goBack();
    await homePage.createRoom('Room 5');
    await page.goBack();
    await homePage.createRoom('Room 6');
    await page.goBack();
    await homePage.createRoom('Room 7');
    await page.goBack();
    await homePage.createRoom('Room 8');
    await page.goBack();
    await homePage.createRoom('Room 9');
    await page.goBack();
    await homePage.createRoom('Room 10');
    await page.goBack();
    await homePage.createRoom('Room 11');
    await page.goBack();
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('RoomMemberships') && res.ok()
    );
    expect(await page.getByTestId('room-item').all()).toHaveLength(10);
    await page.getByRole('button', { name: 'Load more' }).click();
    await page.waitForResponse(
      (res) =>
        !!res.request().postData()?.includes('RoomMemberships') && res.ok()
    );
    expect(await page.getByTestId('room-item').all()).toHaveLength(11);
  });
});
