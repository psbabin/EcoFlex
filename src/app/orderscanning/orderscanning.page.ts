import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
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
  @ViewChildren('modelInputs') modelInputs;
  @ViewChildren('containerInputs') containerInputs;
  @ViewChildren('binLocInputs') binLocInputs;
  @ViewChildren('itemRows') itemRows;

  respData: any;
  itemLists: any;
  custName: any;
  eventLog: string = '';
  orderid: any;
  orderno: any;
  new: boolean;
  old: boolean = true;
  itemCount: any = [];
  autoSave: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private routeto: Router,
    private ecoFlexService: ApiserviceService
  ) {
    this.orderscanning = this.formBuilder.group({
      order: ['', Validators.required]
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.order.setFocus();
    }, 400);
  }

  ngOnInit() { }

  ionViewDidLeave() {
    this.clearForm();
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
    for (let i of this.itemCount) {
      this.orderscanning.removeControl('modelNo_' + i);
      this.orderscanning.removeControl('container_' + i);
      this.orderscanning.removeControl('binLoc_' + i);
    }
    this.itemCount = [];
    this.custName = this.orderid = this.orderno = null;
    this.orderscanning.controls['order'].enable();
    setTimeout(() => {
      this.order.setFocus();
    }, 300);
    this.orderscanning.reset();
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
    let ordervalue = value, count: number = 0;
    if (ordervalue == '' || ordervalue != null) {
      var params = {
        "OrderNumber": ordervalue.toUpperCase(),
      }
    }
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(orderscanning, "post", params).then(response => {
      // let response =
      // {
      //   "orderId": 1000003,
      //   "orderNumber": "CS174885043T2",
      //   "customerName": "Wayfair",
      //   "itemList": [
      //     {
      //       "itemId": 100000,
      //       "modelNumber": "SHK256",
      //       "quantity": 2,
      //       "containerNumber": "24s4sd5",
      //       "binLocation": "xxx",
      //       "isScanned": false
      //     },
      //     {
      //       "itemId": 200000,
      //       "modelNumber": "SHK257",
      //       "quantity": 1,
      //       "containerNumber": "dsdf45asd",
      //       "binLocation": "yyy",
      //       "isScanned": false
      //     },
      //     {
      //       "itemId": 300000,
      //       "modelNumber": "SHK258",
      //       "quantity": 2,
      //       "containerNumber": "56dsa4f56",
      //       "binLocation": "zzz",
      //       "isScanned": false
      //     }
      //   ],
      //   "isNewScreen": false
      // }

      this.respData = response;
      console.log("response", this.respData)
      this.custName = this.respData['customerName'];
      this.orderid = this.respData['orderId'];
      this.orderno = this.respData['orderNumber'];
      if (this.respData['itemList']['length'] != 0) {
        this.itemLists = this.respData['itemList'];
        this.itemLists.map(item => {
          count += item['quantity'];
          item['scanCount'] = 0;
        })
        for (let y = 0; y < count; y++) {
          this.itemCount.push(Number(y) + 1);
          this.orderscanning.addControl('modelNo' + '_' + (Number(y) + 1), new FormControl('', Validators.required));
          this.orderscanning.addControl('container' + '_' + (Number(y) + 1), new FormControl('', Validators.required));
          this.orderscanning.addControl('binLoc' + '_' + (Number(y) + 1), new FormControl('', Validators.required));
        }
        console.log(this.orderscanning);
        this.eventLog = 'Order  ' + ordervalue + ' is successfully scanned \n' + this.eventLog;
        this.orderscanning.controls['order'].disable();
      } else if (this.respData['status'] == 'Fail') {
        this.eventLog = 'Order  ' + ordervalue + ' does not exist. \n' + this.eventLog;
        this.ecoFlexService.PresentToast(this.eventLog, "danger");
      }
      setTimeout(() => {
        this.modelInputs.toArray()[0].setFocus();
      }, 300);
      this.ecoFlexService.dismiss();
    })
  }
  //Method For Scan items

  handleModelScanner(evt, index) {
    let value = evt.target.value.toUpperCase();
    let temp: any = 0;
    if (value != '' && value != null) {
      for (let idx in this.itemLists) {
        if (value == this.itemLists[idx]['modelNumber']) {
          if (!this.itemLists[idx]['isScanned']) {
            this.itemLists[idx]['scanCount']++;
            this.orderscanning.controls['modelNo_' + index].disable();
            this.containerInputs.toArray()[index - 1].setFocus();
            if (this.itemLists[idx]['scanCount'] == this.itemLists[idx]['quantity']) {
              this.itemLists[idx]['isScanned'] = true;
            }
          } else {
            if (this.itemLists[idx]['isScanned']) {
              this.ecoFlexService.PresentToast('Model number already scanned .', "danger");
              evt.target.value = '';
              break;
            }
          }
        } else {
          temp++;
        }
      }
      if (temp >= this.itemLists.length) {
        this.ecoFlexService.PresentToast('Invalid model number scanned .', "danger");
        this.eventLog = 'Model number ' + value + ' is invalid \n' + this.eventLog;
        evt.target.value = '';
      }
    }
  }

  //Method to scan container & bin location
  handleItemScanner(type, index) {
    console.log(this.orderscanning);
    let valid;
    if (type == 'cont') {
      this.binLocInputs.toArray()[index - 1].setFocus();
    } else {
      if (index < this.itemCount.length) {
        this.modelInputs.toArray()[index].setFocus();
      }
      this.orderscanning.controls['modelNo_' + index].disable();
      this.orderscanning.controls['container_' + index].disable();
      this.orderscanning.controls['binLoc_' + index].disable();
    }
    for (let idx of this.itemCount) {
      if (this.orderscanning.controls['modelNo_' + idx].value != '' && this.orderscanning.controls['modelNo_' + idx].value != null &&
        this.orderscanning.controls['container_' + idx].value != '' && this.orderscanning.controls['container_' + idx].value != null &&
        this.orderscanning.controls['binLoc_' + idx].value != '' && this.orderscanning.controls['binLoc_' + idx].value != null) {
        valid = true;
      } else {
        valid = false;
        return valid;
      }
    }
    if (valid) {
      //Auto save method
      if (this.autoSave) {
        this.orderScanSubmitOld();
      }
    }
  }

  //Method to check and uncheck
  isChecked(check) {
    if (check == true) {
      this.autoSave = true;
    } else {
      this.autoSave = false;
    }
  }

  orderScanSubmitOld() {
    let items = [];
    this.itemLists.map(item => {
      if (item['quantity'] == 1) {
        for (let idx of this.itemCount) {
          if (item['modelNumber'] == this.orderscanning.controls['modelNo_' + idx].value) {
            item['containerNumber'] = this.orderscanning.controls['container_' + idx].value;
            item['binLocation'] = this.orderscanning.controls['binLoc_' + idx].value;
          }
        }
      } else {
        items.push(item);
        item['delete'] = true;
      }
    })
    //Remove multiple qty items
    for (let i = this.itemLists.length - 1; i >= 0; i--) {
      if (this.itemLists[i]['delete']) {
        this.itemLists.splice(i, 1);
      }
    }
    //Split multiple qty items into individual 
    items.map(item => {
      for (let i of this.itemCount) {
        if (item['modelNumber'] == this.orderscanning.controls['modelNo_' + i].value) {
          this.itemLists.push({
            modelNumber: this.orderscanning.controls['modelNo_' + i].value,
            containerNumber: this.orderscanning.controls['container_' + i].value,
            binLocation: this.orderscanning.controls['binLoc_' + i].value,
            isScanned: item['isScanned'],
            itemId: item['itemId'],
            quantity: 1
          })
        }
      }
    })

    this.ecoFlexService.present();
    var savescanorder = this.ecoFlexService.baseUrl + this.ecoFlexService.saveorderScanold;
    let jsonobj = {
      "orderNumber": this.orderscanning.controls['order'].value.trim(),
      "orderId": this.orderid,
      "customerName": this.custName,
      "itemList": this.itemLists,
      "isNewScreen": this.new ? true : false
    }
    console.log(jsonobj);
    return
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(savescanorder, "post", jsonobj).then(resp => {
      if (resp['status'] == 'Success') {
        this.ecoFlexService.PresentToast("Scan completed" + resp['status'] + " ", "success");
      }
      this.ecoFlexService.dismiss();
    })
  }

  //Method to change window type
  windowTypeChange(type) {
    if (type == 'old') {
      this.old = true;
      this.new = false;
    } else {
      this.new = true;
      this.old = false;
    }
    this.clearForm();
  }

  //Method to clear row data
  clearSerialField(idx) {
    let value = this.orderscanning.controls['modelNo_' + idx].value;
    if (value != '' && value != null) {
      for (let item of this.itemLists) {
        if (item['modelNumber'] == value) {
          item['scanCount']--;
          if (item['quantity'] != item['scanCount']) {
            item['isScanned'] = false;
          }
          break;
        }
      }
      this.orderscanning.controls['modelNo_' + idx].enable();
      this.orderscanning.controls['container_' + idx].enable();
      this.orderscanning.controls['binLoc_' + idx].enable();

      this.orderscanning.controls['modelNo_' + idx].reset();
      this.orderscanning.controls['container_' + idx].reset();
      this.orderscanning.controls['binLoc_' + idx].reset();
      setTimeout(() => {
        this.modelInputs.toArray()[idx - 1].setFocus();
      }, 300);
    }
  }
}
