/*import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupContentComponent } from './group-content.component';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { MemoryStorageKey, LocalStorageKey } from '../../../services/util/global-storage.service';

const TRANSLATION_DE = require('../../../../assets/i18n/home/de.json');
const TRANSLATION_EN = require('../../../../assets/i18n/home/en.json');

const TRANSLATIONS = {
  DE: TRANSLATION_DE,
  EN: TRANSLATION_EN
};

class JsonTranslationLoader implements TranslateLoader {
  getTranslation(code: string = ''): Observable<object> {
    if (code !== null) {
      const uppercased = code.toUpperCase();

      return of(TRANSLATIONS[uppercased]);
    } else {
      return of({});
    }
  }
}

@Injectable()
class MockGlobalStorageService {

  getMemoryItem(key: MemoryStorageKey) {
    return undefined;
  }

  getLocalStorageItem(key: LocalStorageKey) {
    return undefined;
  }

  setMemoryItem(key: MemoryStorageKey, value: any) {
  }

  setLocalStorageItem(key: LocalStorageKey, value: any) {
  }

  deleteLocalStorageItem(key: LocalStorageKey) {
  }
}

describe('GroupContentComponent', () => {
  let component: GroupContentComponent;
  let fixture: ComponentFixture<GroupContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupContentComponent ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(GroupContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});*/
