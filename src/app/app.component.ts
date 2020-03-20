import { Component } from '@angular/core';

import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ApiserviceService } from './apiservice.service';
import { Network } from '@ionic-native/network/ngx';
import { variable } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  isTablet: boolean;
  networkStatus: any;
  version: string = "0.0.9"; //UAT
  // version: string = "0.0.7"; //PROD

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
    let mode = this.ecoFlexService.baseUrl.includes("https") ? "PROD" : "UAT";
    this.ecoFlexService.ajaxCallService(messageurl, "post", '').then(resp => {
      this.ecoFlexService.errorMessages = resp;
      localStorage.setItem("Message", JSON.stringify(resp['messages']));
      if (mode == "UAT") {
        if (resp['appVersionUAT'] != this.version) {
          this.ecoFlexService.presentAlert();
          this.ecoFlexService.versionChecked = false;
        } else {
          this.ecoFlexService.versionChecked = true;
        }
      } else {
        if (resp['appVersionPRD'] != this.version) {
          this.ecoFlexService.presentAlert();
          this.ecoFlexService.versionChecked = false;
        } else {
          this.ecoFlexService.versionChecked = true;
        }
      }
    })
  }

  ionViewDidLeave() {
    this.networkStatus.unsubscribe();
  }
}

