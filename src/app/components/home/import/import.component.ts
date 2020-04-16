import { AfterContentInit, Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/http/room.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/http/authentication.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../services/util/notification.service';
import { UserRole } from '../../../models/user-roles.enum';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit, AfterContentInit {

  selectedFile: File;
  jsonToUpload: JSON;
  isLoggedIn = false;

  constructor(private roomService: RoomService,
              private router: Router,
              private authenticationService: AuthenticationService,
              private translateService: TranslateService,
              private notificationService: NotificationService) {
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      document.getElementById('message').focus();
    }, 500);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authenticationService.isLoggedIn();
  }

  navToLogin() {
    this.authenticationService.setRedirect('import');
    this.router.navigate(['login']);
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        const parsed = JSON.parse(fileReader.result);
        this.jsonToUpload = parsed.exportData;
      }
    };
    fileReader.onerror = (error) => {
      console.log(error);
    };
    setTimeout(() => {
      document.getElementById('create-button').focus();
    }, 500);
  }

  onUpload() {
    this.roomService.importv2Room(this.jsonToUpload).subscribe(room => {
      this.translateService.get('home-page.created-1').subscribe(msg1 => {
        this.translateService.get('home-page.created-2').subscribe(msg2 => {
          this.notificationService.show(msg1 + room.name + msg2);
        });
      });
      this.authenticationService.setAccess(room.shortId, UserRole.CREATOR);
      this.authenticationService.assignRole(UserRole.CREATOR);
      this.router.navigate([`creator/room/${room.shortId}`]);
    },
        error => {
      this.translateService.get('import.error').subscribe(msg => {
        this.notificationService.show(msg);
      });
    });
  }

}
