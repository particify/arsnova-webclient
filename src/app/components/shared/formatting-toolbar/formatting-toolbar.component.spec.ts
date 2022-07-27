import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTranslationLoader } from '@arsnova/testing/test-helpers';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FormattingToolbarComponent } from './formatting-toolbar.component';
import { MatIconModule } from '@angular/material/icon';


describe('FormattingToolbarComponent', () => {
  let component: FormattingToolbarComponent;
  let fixture: ComponentFixture<FormattingToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormattingToolbarComponent ],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: JsonTranslationLoader
          },
          isolate: true
        }),
        MatIconModule
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormattingToolbarComponent);
    component = fixture.componentInstance;
    component.inputElement = document.createElement('textarea');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should insert bold signs at cursor position at end of input value', () => {
    component.inputElement.value = 'I would like to start the next sentence with a bold word. ';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const boldOption = component.formattingOptions.find(o => o.name === 'bold');
    component.addFormatting(boldOption);
    expect(component.inputElement.value).toBe('I would like to start the next sentence with a bold word. ****');
  });

  it('should insert bold signs around selection of input value', () => {
    component.inputElement.value = 'I would like to make THIS bold.';
    component.inputElement.selectionStart = 21;
    component.inputElement.selectionEnd = 25;
    const boldOption = component.formattingOptions.find(o => o.name === 'bold');
    component.addFormatting(boldOption);
    expect(component.inputElement.value).toBe('I would like to make **THIS** bold.');
  });

  it('should remove bold signs around selection of input value', () => {
    component.inputElement.value = 'I no longer want to make **THIS** bold.';
    component.inputElement.selectionStart = 27;
    component.inputElement.selectionEnd = 31;
    const boldOption = component.formattingOptions.find(o => o.name === 'bold');
    component.addFormatting(boldOption);
    expect(component.inputElement.value).toBe('I no longer want to make THIS bold.');
  });

  it('should insert list sign at start of line if no selection', () => {
    component.inputElement.value = 'List:\nThis should be a list item';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const listOption = component.formattingOptions.find(o => o.name === 'list');
    component.addFormatting(listOption);
    expect(component.inputElement.value).toBe('List:\n* This should be a list item');
  });

  it('should insert list sign at start of line if no selection and its not the last line/end of text', () => {
    component.inputElement.value = 'List:\nThis should be a list item\nThis should be another list item later'.toString();
    component.inputElement.selectionStart = 32;
    component.inputElement.selectionEnd = 32;
    const listOption = component.formattingOptions.find(o => o.name === 'list');
    component.addFormatting(listOption);
    expect(component.inputElement.value).toBe('List:\n* This should be a list item\nThis should be another list item later');
  });

  it('should remove list sign from start of line', () => {
    component.inputElement.value = 'List:\n* This is a list item';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const listOption = component.formattingOptions.find(o => o.name === 'list');
    component.addFormatting(listOption);
    expect(component.inputElement.value).toBe('List:\nThis is a list item');
  });

  it('should insert image sign at cursor position w/ url placeholder if no selection', () => {
    component.inputElement.value = 'See the following image: ';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const imageOption = component.formattingOptions.find(o => o.name === 'image');
    component.addFormatting(imageOption);
    expect(component.inputElement.value).toBe('See the following image: ![alt text](https://)');
  });

  it('should insert image sign around selection w/o url placeholder', () => {
    component.inputElement.value = 'See the following image: https://example.com/image';
    component.inputElement.selectionStart = 25;
    component.inputElement.selectionEnd = 50;
    const imageOption = component.formattingOptions.find(o => o.name === 'image');
    component.addFormatting(imageOption);
    expect(component.inputElement.value).toBe('See the following image: ![alt text](https://example.com/image)');
  });

  it('should set cursor position inside bold signs if no selection', () => {
    component.inputElement.value = 'I would like to start the next sentence with a bold word. ';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const boldOption = component.formattingOptions.find(o => o.name === 'bold');
    component.addFormatting(boldOption);
    expect(component.inputElement.selectionStart).toBe(component.inputElement.value.length - boldOption.openingTag.length);
    expect(component.inputElement.selectionEnd).toBe(component.inputElement.value.length - boldOption.openingTag.length);
  });

  it('should offset the text selection when formatting it bold', () => {
    component.inputElement.value = 'I would like to make THIS bold.';
    component.inputElement.selectionStart = 21;
    component.inputElement.selectionEnd = 25;
    const boldOption = component.formattingOptions.find(o => o.name === 'bold');
    component.addFormatting(boldOption);
    expect(component.inputElement.selectionStart).toBe(29);
    expect(component.inputElement.selectionEnd).toBe(29);
  });

  it('should set cursor selection on placeholder after insert image formatting w/o selected text', () => {
    component.inputElement.value = 'See the following image: ';
    component.inputElement.selectionStart = component.inputElement.value.length;
    component.inputElement.selectionEnd = component.inputElement.value.length;
    const imageOption = component.formattingOptions.find(o => o.name === 'image');
    component.addFormatting(imageOption);
    expect(component.inputElement.selectionStart).toBe(37);
    expect(component.inputElement.selectionEnd).toBe(45);
  });

  it('should offset the selection of the URL when inserting an image', () => {
    component.inputElement.value = 'See the following image: https://example.com/image';
    component.inputElement.selectionStart = 25;
    component.inputElement.selectionEnd = 50;
    const imageOption = component.formattingOptions.find(o => o.name === 'image');
    component.addFormatting(imageOption);
    expect(component.inputElement.selectionStart).toBe(component.inputElement.value.length);
    expect(component.inputElement.selectionEnd).toBe(component.inputElement.value.length);
  });
});
