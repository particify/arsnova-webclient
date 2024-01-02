import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { FooterComponent } from '@app/standalone/footer/footer.component';
import { Observable, filter, of } from 'rxjs';

export class NavButtonSection {
  buttons: NavButton[];
  subheader?: string;

  constructor(buttons: NavButton[], subheader?: string) {
    this.buttons = buttons;
    this.subheader = subheader;
  }
}

export class NavButton {
  name: string;
  i18nName: string;
  icon: string;
  display: Observable<boolean>;

  constructor(
    name: string,
    i18nName: string,
    icon: string,
    display = of(true)
  ) {
    this.name = name;
    this.i18nName = i18nName;
    this.icon = icon;
    this.display = display;
  }
}

@Component({
  selector: 'app-navigation-drawer',
  standalone: true,
  imports: [CoreModule, FooterComponent],
  templateUrl: './navigation-drawer.component.html',
  styleUrls: ['./navigation-drawer.component.scss'],
})
export class NavigationDrawerComponent implements OnInit {
  @Input({ required: true }) buttonSections!: NavButtonSection[];
  @Input({ required: true }) parentRoute!: string;
  @Input() showFooter = true;
  @Input() backgroundColor = 'background';
  currentPage?: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.setCurrentPage();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setCurrentPage();
      });
  }

  setCurrentPage() {
    this.currentPage = this.route.snapshot.firstChild?.url[0].path;
  }

  changePage(page: string) {
    setTimeout(() => {
      this.router.navigate([this.parentRoute, page]);
      this.currentPage = page;
    });
  }
}
