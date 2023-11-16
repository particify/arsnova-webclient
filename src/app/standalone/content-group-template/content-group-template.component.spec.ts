import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentGroupTemplateComponent } from './content-group-template.component';
import { getTranslocoModule } from '@testing/transloco-testing.module';
import { ContentGroupTemplate } from '@app/core/models/content-group-template';

describe('ContentGroupTemplateComponent', () => {
  let component: ContentGroupTemplateComponent;
  let fixture: ComponentFixture<ContentGroupTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContentGroupTemplateComponent, getTranslocoModule()],
    });
    fixture = TestBed.createComponent(ContentGroupTemplateComponent);
    component = fixture.componentInstance;
    component.template = new ContentGroupTemplate(
      'Template name',
      'Template description',
      'en',
      [{ id: 'id', name: 'Test tag', verified: true }],
      'CC0-1.0',
      false,
      'attribution name',
      ['template1', 'template2', 'template3']
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
