[TOC]

# Making HTML elements a11y

### Example (meeting_room) for Buttons

```html
<button
  mat-button
  *ngIf="user && deviceType === 'desktop'"
  [matMenuTriggerFor]="userMenu"
  aria-labelledby="meeting_room"
></button>

<!--Hidden Div's for a11y-Descriptions-->
<div class="visually-hidden">
  <div id="meeting_room">{{'header.a11y-meeting_room' | transloco}}</div>
</div>
```

### style.sccs

```scss
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  left: -10000px;
}
```

### Dynamic ARIA labels

Dynamic Aria labels like used in generic components are also possible!

For usage only the `attr.` tag prefix must be added like in following code example:

```html
<button
      mat-button
      attr.aria-labelledby="{{ ariaPrefix + 'cancel' }}"
...
...
<div id="{{ ariaPrefix + 'cancel'}}">{{ buttonsLabelSection + '.cancel-description' | transloco }}</div>
```

@see: [Accessible components: #2 dynamic ARIA labels](https://blog.prototypr.io/accessible-components-2-dynamic-aria-labels-6bf281f26d17)

### Live Announcer

#### To Add Live Announcer you need to import:

`import { LiveAnnouncer } from '@angular/cdk/a11y';`

##### And add to the constructor:

```typescript
constructor(
    ...
    private liveAnnouncer: LiveAnnouncer) {
    ...
}
```

#### You also need to add to the `ngOnInit()` - Function:

```typescript
ngOnInit() {
    ...
    this.announce();
}
```

#### And this is the function to start the announcement:

```typescript
public announce() {
    this.liveAnnouncer.announce('Willkommenstext', 'assertive');
}
```

#### Problems with JAWS and Microsoft Speech

JAWS and Microsoft Speech cannot play the "title" attributes. Only NVDA plays the "title" attribute.
Attribute "aria-label" does not work with multi-language titles, voice output reads registered string directly 1 to 1.
`aria-labelledby` works finde with Microsoft Speech, JAWS and NVDA. If "title" attribute is additionally set, NVDA plays the text twice.

### Keyboard Shortcut

#### Directive

Keyboard shortcuts can be added to any DOM element by using the `appHotkey` directive.
This directive automatically registers and unregisters hotkeys which can either focus the element or trigger its click handler.
The following additional attributes can be set:

- `appHotkeyCtrl`, `appHotkeyAlt` and `appHotkeyShift`: Sets modifier keys which need to be pressed to trigger the hotkey.
- `appHotkeyAction`: `HotkeyAction.FOCUS` (default) or `HotkeyAction.CLICK`
- `appHotkeyTitle`: Sets the title for a11y. If not set, `matTooltip` will be used as a fallback.
- `appHotkeyDisabled`: Disables the hotkey. This is useful if a the element is rendered but currently not visible.

##### Example

```html
<button appHotkey="h">Do something!</button>

<button
  appHotkey="i"
  [appHotkeyControl]="true"
  [appHotkeyAction]="HotkeyAction.CLICK"
  appHotkeyTitle="Optional hotkey action description"
  [appHotkeyDisabled]="!hotkeyCondition"
  (click)="doSomething()"
>
  Do something!
</button>
```

#### Manual registration

If there is no element to bind a hotkey to or a custom action handler is required,
a hotkey can be registered via the `HotkeyService`'s `registerHotkey` method.
If manual registration is used, it is the developers responsibility to unregister the hotkey when it is no longer valid.

##### Example

```typescript
private hotkeyRefs: Symbol[] = [];

constructor(private hotkeyService: HotkeyService) { }

ngOnInit() {
  this.hotkeyService.registerHotkey({
    key: 'h',
    action: () => this.doSomething(),
    actionTitle: 'Do something!'
  }, this.hotkeyRefs);
}

ngOnDestroy() {
  this.hotkeyRefs.forEach(h => this.hotkeyService.unregisterHotkey(h));
}
```

## HTML5 Accessibility: aria-hidden and role=”presentation”

A page about `aria-hidden` and `role="presentation"` attribute usage tests:

Source: [HTML5 Accessibility: aria-hidden and role=”presentation”](http://john.foliot.ca/aria-hidden/)
