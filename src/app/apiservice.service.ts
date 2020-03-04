import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  // baseUrl: string = 'http://71.252.180.148/Opal/uat/EcoFlex/'; //UAT
  // baseUrl: string = 'https://order-fulfillment.bz/ecoflex/'; //PROD Old
  baseUrl: string = 'https://www2.order-fulfillment.bz/ecoflex/'; //PROD New

  userLogin: string = 'UserApi/UserLogin';
  errMessage: string = 'UserApi/GetResponseMessages';
  getOrderScan: string = 'OrdersApi/ScanOrderDetail';
  saveorderScanold: string = 'OrdersApi/SaveScanOrder';
  serialVerify: String = "ordersapi/SerialNumberVerification";

  isLoading: any;
  ajaxData: any;
  errorMessages: any;
  noInternet: boolean;
  versionChecked: boolean;

  constructor(public http: HttpClient,
    public toastController: ToastController,
    public loadingCtrl: LoadingController,
    public alert: AlertController) { }
  async PresentToast(msg, color) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 3000,
      position: 'bottom',
      keyboardClose: false,
      showCloseButton: true,
      cssClass: "toast",
    });
    toast.present();
  }

  async present() {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      // duration: 3000,
      message: 'Please wait...',
      spinner: 'lines',
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss();
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss();
  }
  ajaxCallService(dataUrl, dataType, dataParam) {
    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Methods', 'POST, GET ,OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'application/json');
    headers.append('Content-Type', 'application/json');
    if (!this.noInternet) {
      switch (dataType) {
        case 'get': return new Promise(resolve => {  //get return type	
          this.http.get(dataUrl)
            .subscribe(data => {
              this.ajaxData = data;
              resolve(this.ajaxData);
            }, (err) => {
              this.PresentToast('Network error, Please try again', 'danger');
              resolve(err);
            });
        });
        case 'post': return new Promise(resolve => {	//post return type
          // this.presentLoading();
  
          this.http.post(dataUrl, dataParam, { headers: headers })
            .subscribe(data => {
              this.ajaxData = data;
              resolve(this.ajaxData);
            }, (err) => {
              if (err) {
                this.PresentToast('Network error, Please try again', 'danger');
                // resolve(err);
                // throw(err);
                throwError(err);
              } else {
                this.PresentToast('Network error, Please try again', 'danger');
              }
            });
        });
      } 
    } else {
      this.PresentToast('Network error! Check your network and try again.', 'danger');
      this.dismiss();
    }   
  }

  //Method to present alert fro App update
  async presentAlert() {
		const alert = await this.alert.create({
			header: "App Update",
			message: "A new version available for the app, Kindly update to the latest version!",
      buttons: [
        {
          text: 'Done',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah', blah);
            navigator['app'].exitApp();
          }
        }
      ]
		});
		await alert.present();
	}
}
