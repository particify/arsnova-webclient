import { Component, OnInit } from '@angular/core';
import { BarBaseComponent, BarItem } from '../bar-base';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutingService } from '../../../../services/util/routing.service';
import { GlobalStorageService, STORAGE_KEYS } from '../../../../services/util/global-storage.service';
import { UserRole } from '../../../../models/user-roles.enum';

export class NavBarItem extends BarItem {

  url: string;
  news: boolean;

  constructor(name: string, icon: string, url: string, news: boolean) {
    super(name, icon);
    this.url = url;
    this.news = news;
  }
}

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent extends BarBaseComponent implements OnInit {

  barItems: NavBarItem[] = [];
  features: BarItem[] = [
    new BarItem('comments', 'question_answer'),
    new BarItem('group', 'equalizer'),
    new BarItem('survey', 'thumbs_up_down')
  ];
  currentRouteIndex: number;
  isActive = true;

  constructor(private router: Router,
              private routingService: RoutingService,
              private route: ActivatedRoute,
              private globalStorageService: GlobalStorageService) {
    super();
  }

  initItems() {
    this.route.data.subscribe(data => {
      for (const feature of this.features) {
        let url = `/${this.routingService.getRoleString(data.viewRole)}/room/${data.room.shortId}/${feature.name}`;
        if (feature.name === 'group') {
          url += this.getQuestionUrl(data.viewRole);
        }
        this.barItems.push(
          new NavBarItem(
            feature.name,
            feature.icon,
            url,
            false));
      }
      this.currentRouteIndex = this.barItems.map(s => s.url).indexOf(this.barItems.filter(s => this.router.url.includes(s.url))[0].url);
      setTimeout(() => {
        this.toggleVisibility(false);
      }, 500);
    });
  }

  getQuestionUrl(role: UserRole): string {
    let url =  '/' + this.globalStorageService.getItem(STORAGE_KEYS.LAST_GROUP);
    if (role === UserRole.CREATOR) {
      url += '/statistics';
    }
    return url;
  }

  navToUrl(index: number) {
    const url = this.barItems[index].url;
    if (url) {
      this.router.navigate([url]);
    }
  }

  toggleVisibility(active: boolean) {
    const timeout = active ? 0 : 500;
    setTimeout(() => {
      this.isActive = active;
    }, timeout);
  }
}
