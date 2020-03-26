import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './direct-entry.component.html'
})
export class DirectEntryComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      const shortId = params['shortId'];
      // ToDo: Maybe check if valid short id
      this.router.navigate(['/participant/room/' + shortId]);
    });
  }
}
