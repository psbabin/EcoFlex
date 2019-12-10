import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-orderscanning',
  templateUrl: './orderscanning.page.html',
  styleUrls: ['./orderscanning.page.scss'],
})
export class OrderscanningPage implements OnInit {
  public orderscanning: FormGroup;
  @ViewChild('order', { static: false }) order;
  @ViewChild('customername', { static: false }) customername;
  respData: unknown;
  itemLists: any;
  custName: any;
  eventLog: string;
  orderid: any;
  orderno: any;
  statuss: any;
  ItemsList: any;

  constructor(
    private formBuilder: FormBuilder,
    private routeto: Router,
    private ecoFlexService: ApiserviceService
  ) {
    this.orderscanning = this.formBuilder.group({
      order: [''],
      orderScanNew: [''],
      orderScanOld: ['']

    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.order.setFocus();

    }, 400);
  }

  ngOnInit() {
  }

  //Method For goback Menu
  goToback() {
    let ordernumber = this.orderscanning.value.order;
    if (ordernumber == " " || ordernumber != null) {
      this.routeto.navigate(['/menus']);
    } else {
      this.ecoFlexService.PresentToast("There is Unsave Data in the form,either save or clear the Form", "danger");
    }
  }

  //Method For clearForm
  clearForm() {
    this.orderscanning.reset();
    setTimeout(() => {
      this.order.setFocus();
    }, 400);
  }

  //Method For Scan OrderNo via enterKey

  handleOrderScanner(evt) {
    console.log("value", evt);
    setTimeout(() => {
      let value = evt.target.value;
      this.newOrderSearch(value);
    }, 800);
  }

  //Method For Scan OrderNo via Search

  orderScan() {
    let value = this.orderscanning.controls['order'].value;
    this.newOrderSearch(value);
  }

  //Method For Scan Items 
  newOrderSearch(value) {
    var orderscanning = this.ecoFlexService.baseUrl + this.ecoFlexService.getOrderScan;
    let ordervalue = value;
    if (ordervalue == '' || ordervalue != null) {
      var params = {
        "OrderNumber": ordervalue.toUpperCase(),
      }
    }
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(orderscanning, "post", params).then(resp => {
      this.respData = resp;
      console.log("response", this.respData)
      this.custName = resp['customerName'];
      this.orderid = resp['orderId'];
      this.orderno = resp['orderNumber'];
      this.statuss = resp['status'];
      this.ItemsList = resp['itemList'];
      if (resp['itemList']['length'] != 0) {
        this.itemLists = resp['itemList'];
        this.eventLog = 'Order  ' + ordervalue + ' is successfully scanned';
        this.orderscanning.controls['order'].disable();
      } else if (resp['status'] == 'Fail') {
        this.eventLog = 'Order  ' + ordervalue + ' does not exist.';
        this.ecoFlexService.PresentToast(this.eventLog, "danger");
      }
      this.ecoFlexService.dismiss();
    })
  }
  //Method For Scan items

  handleItemScanner(evt) {
    setTimeout(() => {
      let value = evt.target.value;
      this.itemsSearch(value);
    }, 800);

  }

  itemsSearch(value) {
    console.log("items", value);
  }

  //Method For Change toggle

  formselectNew() {

  }

  orderscansubmitOld() {
    this.ecoFlexService.present();
    var savescanorder = this.ecoFlexService.baseUrl + this.ecoFlexService.saveorderScanold;
    let jsonobj = {
      "orderNumber": this.orderscanning.value.order,
      "orderId": this.orderid,
      "customerName": this.custName
    }
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(savescanorder, "post", jsonobj).then(resp => {
      if (resp['status'] == 'Success') {
        this.ecoFlexService.PresentToast("Scan completed" + resp['status'] + " ", "success");
      }
      this.ecoFlexService.dismiss();

    })

  }
}
