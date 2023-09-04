import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'a11yRenderedBody' })
export class A11yRenderedBodyPipe implements PipeTransform {
  transform(renderedBody: string): string | null {
    const text = document.createElement('span');
    text.innerHTML = renderedBody;
    return text.textContent;
  }
}
