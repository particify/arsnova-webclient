import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormattingService } from '@app/core/services/http/formatting.service';
import { LoadingIndicatorComponent } from '@app/standalone/loading-indicator/loading-indicator.component';
import { RenderedTextComponent } from '@app/standalone/rendered-text/rendered-text.component';
import { Subject } from 'rxjs';

@Component({
  imports: [RenderedTextComponent],
  template: `<app-rendered-text rawText="**raw**" [dynamic]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OnPushHostComponent {}

describe('RenderedTextComponent', () => {
  let rendered$: Subject<{ html: string }>;

  beforeEach(() => {
    rendered$ = new Subject();
    const formattingService = jasmine.createSpyObj(['postString']);
    formattingService.postString.and.returnValue(rendered$);
    TestBed.configureTestingModule({
      providers: [{ provide: FormattingService, useValue: formattingService }],
    });
  });

  it('should show the asynchronously rendered text inside an OnPush host', () => {
    const fixture = TestBed.createComponent(OnPushHostComponent);
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.directive(LoadingIndicatorComponent))
    ).not.toBeNull();

    rendered$.next({ html: '<strong>raw</strong>' });
    fixture.detectChanges();

    expect(
      fixture.debugElement.query(By.directive(LoadingIndicatorComponent))
    ).toBeNull();
    const text = fixture.nativeElement.querySelector('.rendered-text');
    expect(text.innerHTML).toBe('<strong>raw</strong>');
  });
});
