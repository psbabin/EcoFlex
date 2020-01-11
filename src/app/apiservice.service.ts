import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiserviceService {
  baseUrl: string = 'http://71.252.180.148/Opal/uat/EcoFlex/';
  // baseUrl: string = 'https://order-fulfillment.bz/ecoflex/';

  userLogin: string = 'UserApi/UserLogin';
  errMessage: string = 'UserApi/GetResponseMessages';
  getOrderScan: string = 'OrdersApi/ScanOrderDetail';
  saveorderScanold: string = 'OrdersApi/SaveScanOrder';
  serialVerify: String = "ordersapi/SerialNumberVerification";

  isLoading: any;
  ajaxData: any;
  err: any;
  errorMessages: any;

  constructor(public http: HttpClient,
    public toastController: ToastController,
    public loadingCtrl: LoadingController) { }
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
    switch (dataType) {
      case 'get': return new Promise(resolve => {  //get return type	
        this.http.get(dataUrl)
          .subscribe(data => {
            this.ajaxData = data;
            resolve(this.ajaxData);
          }, (err) => {
            this.err = err.error;
            this.PresentToast('Unable to reach server, Please try again', 'danger');
            resolve(this.err);

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
              this.PresentToast('Unable to reach server, Please try again', 'danger');
              resolve(this.err);
            } else {
              this.PresentToast('Unable to reach server, Please try again', 'danger');
            }
          });
      });
    }
  }

}
