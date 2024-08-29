import { Component, OnInit } from '@angular/core';
import { ReleaseNotesService } from '../services/super-admin/release-notes/release-notes.service';
import { UtilService } from '../services/util.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less']
})
export class FooterComponent implements OnInit {

  relaseVersion: string = "";
  footerEventsubscription: Subscription;
  newVersion: string = "";
  constructor(
    private releasenotesservice: ReleaseNotesService,
    private utilsService: UtilService,
  ) {
    this.footerEventsubscription = this.utilsService.getUpdateVersionCheck().subscribe(() => {
      this.getReleaseUpdateVersion();
    })
  }

  ngOnInit() {
    this.getReleaseUpdateVersion();
  }
  async getReleaseUpdateVersion() {
    await this.releasenotesservice.getReleaseVersion().subscribe(data => {
      let response:string[] = JSON.parse(data.map.data);
      this.newVersion = (response[0]).toString();
    })

  }

}
