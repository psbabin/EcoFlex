import { Component } from '@angular/core';

import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ApiserviceService } from './apiservice.service';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  isTablet: boolean;
  networkStatus: any;
  version: string = "0.0.6"; //UAT
  // version: string = "0.0.4"; //PROD

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private ecoFlexService: ApiserviceService,
    private network: Network,
    public events: Events
  ) {
    this.initializeApp();
    this.getErrorMessages();
    this.isTablet = this.platform.is('ipad');
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.networkStatus = this.network.onDisconnect().subscribe(() => {
      this.ecoFlexService.noInternet = true;
      this.events.publish('online', this.ecoFlexService.noInternet);
      this.ecoFlexService.PresentToast('You are offline, Connect to network', 'danger');
    });

    this.networkStatus = this.network.onConnect().subscribe(() => {
      this.ecoFlexService.noInternet = false;
      this.ecoFlexService.PresentToast('Back to online', 'success');
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

  ionViewDidLeave() {
    this.networkStatus.unsubscribe();
  }
}

