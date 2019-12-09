import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ApiserviceService } from './apiservice.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private ecoFlexService: ApiserviceService
  ) {
    this.initializeApp();
    this.getErrorMessages();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  getErrorMessages() {
    let messageurl = this.ecoFlexService.baseUrl + this.ecoFlexService.errMessage;
    this.ecoFlexService.ajaxCallService(messageurl, "post", '').then(resp => {
      console.log(resp);
      this.ecoFlexService.errorMessages = resp;
      localStorage.setItem("Message", JSON.stringify(resp));
    })

  }
}

