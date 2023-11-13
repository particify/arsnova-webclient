import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CoreModule } from '@app/core/core.module';
import { DrawerService } from '@app/core/services/util/drawer.service';
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
export class NavigationDrawerComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('drawer') drawer: MatDrawer;
  @Input() buttonSections: NavButtonSection[];
  @Input() parentRoute: string;
  @Input() showFooter = true;
  @Input() backgroundColor = 'background';
  @Input() responsive = true;
  currentPage?: string;
  isMobile: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private drawerService: DrawerService
  ) {}

  ngOnDestroy(): void {
    this.drawerService.setDrawer();
  }

  ngOnInit() {
    this.isMobile = innerWidth < 1000 && this.responsive;
    this.setCurrentPage();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setCurrentPage();
      });
  }

  ngAfterViewInit(): void {
    if (this.isMobile) {
      this.drawerService.setDrawer(this.drawer);
    }
  }

  setCurrentPage() {
    this.currentPage = this.route.snapshot.firstChild?.url[0].path;
  }

  changePage(page: string) {
    if (this.isMobile) {
      this.drawer.close();
    }
    setTimeout(() => {
      this.router.navigate([this.parentRoute, page]);
      this.currentPage = page;
    });
  }
}
