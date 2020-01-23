import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';
import { AlertController } from '@ionic/angular';
import { AppComponent } from '../app.component'
import { error } from 'util';

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
  @ViewChildren('serialInputs') serialInputs;

  itemLists: any;
  custName: any;
  eventLog: string = '';
  orderid: any;
  orderno: any;
  new: boolean;
  old: boolean = true;
  itemCount: any = [];
  autoSave: boolean;
  message: any;
  checked: any;
  serialNumbers: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private routeto: Router,
    private ecoFlexService: ApiserviceService,
    public appComp: AppComponent
  ) {
    this.orderscanning = this.formBuilder.group({
      order: ['', Validators.required]
    });
  }

  ionViewDidEnter() {
    let msg = JSON.parse(localStorage.getItem(("Message")));
    if (msg) this.message = msg;
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
    let ordernumber = this.orderscanning.controls['order'].value;
    if (ordernumber == "" || ordernumber == null) {
      this.routeto.navigate(['/menus']);
    } else {
      this.ecoFlexService.PresentToast(this.message[2], "danger");
    }
  }

  //Method For clearForm
  clearForm() {
    for (let i of this.itemCount) {
      this.orderscanning.removeControl('serialNo_' + i);
      this.orderscanning.removeControl('modelNo_' + i);
      this.orderscanning.removeControl('container_' + i);
      this.orderscanning.removeControl('binLoc_' + i);
    }
    this.itemCount = [];
    this.itemLists = [];
    this.serialNumbers = [];
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
      this.orderSearch(value);
    }, 500);
  }

  //Method For Scan OrderNo via Search
  orderScan() {
    let value = this.orderscanning.controls['order'].value;
    this.orderSearch(value);
  }

  //Method For Scan Items 
  orderSearch(value) {
    this.itemCount = [];
    this.itemLists = [];
    this.ecoFlexService.present();
    var orderscanning = this.ecoFlexService.baseUrl + this.ecoFlexService.getOrderScan;
    let ordervalue = value.toUpperCase(), count: number = 0;

    if (ordervalue != "" && ordervalue != null) {
      var params = {
        "OrderNumber": ordervalue
      }
      this.ecoFlexService.ajaxCallService(orderscanning, "post", params).then(resp => {
        if (resp['status'].toLowerCase() != 'fail') {
          console.log("response", resp)
          this.custName = resp['customerName'];
          this.orderid = resp['orderId'];
          this.orderno = resp['orderNumber'];
          if (resp['itemList']['length'] != 0) {
            this.itemLists = resp['itemList'];
            this.itemLists.map(item => {
              count += item['quantity'];
              item['scanCount'] = 0;
            })
            for (let y = 0; y < count; y++) {
              this.itemCount.push(Number(y) + 1);
              if (this.new) {
                this.orderscanning.addControl('serialNo_' + (Number(y) + 1), new FormControl('', Validators.required));
                this.orderscanning.addControl('modelNo_' + (Number(y) + 1), new FormControl('', Validators.required));
                this.orderscanning.addControl('binLoc_' + (Number(y) + 1), new FormControl('', Validators.required));
              } else {
                this.orderscanning.addControl('modelNo_' + (Number(y) + 1), new FormControl('', Validators.required));
                this.orderscanning.addControl('container_' + (Number(y) + 1), new FormControl('', Validators.required));
                this.orderscanning.addControl('binLoc_' + (Number(y) + 1), new FormControl('', Validators.required));
              }
            }
            this.eventLog = 'Order # ' + ordervalue + ' is successfully scanned \n' + this.eventLog;
            this.orderscanning.controls['order'].disable();
          }
          setTimeout(() => {
            if (this.new) {
              this.serialInputs.toArray()[0].setFocus();
            } else {
              this.modelInputs.toArray()[0].setFocus();
            }
          }, 300);
        } else {
          this.eventLog = 'Order # ' + ordervalue + ' ' + resp['message'] + '\n' + this.eventLog;
          this.ecoFlexService.PresentToast(resp['message'], "danger");
          setTimeout(() => {
            this.order.setFocus();
          }, 300);
          this.orderscanning.controls['order'].setValue('');
        }
        this.ecoFlexService.dismiss();
      })
    } else {
      this.ecoFlexService.PresentToast(this.message[3], "danger");
      this.eventLog = 'Order # ' + ordervalue + ' ' + this.message[3] + '\n' + this.eventLog;
      this.ecoFlexService.dismiss();
    }
  }
  //Method For Scan items

  handleModelScanner(evt, index) {
    let elementId = evt.currentTarget.id;

    setTimeout(() => {
      let value = evt.target.value.toUpperCase();
      let temp: any = 0, valid;
      // if (value != '' && value != null) {
      if (elementId.startsWith('serial')) {
        if (value != '' && value != null && /^[0-9]+$/.test(value)) {
          for (var i = 0; i < this.serialNumbers.length; i++) {
            if (value == this.serialNumbers[i]) {
              this.eventLog = 'Serial Number ' + value + ' already scanned \n' + this.eventLog;
              this.ecoFlexService.PresentToast('Serial number already scanned', 'danger');
              evt.target.value = '';
              return false;
            }
          }
          // this.ecoFlexService.present();
          let url = this.ecoFlexService.baseUrl + this.ecoFlexService.serialVerify;
          let jsonobj = {
            "OrderId": this.orderid,
            "SerialNumber": value
          }
          this.ecoFlexService.ajaxCallService(url, "post", jsonobj).then(resp => {
            if (!resp['error'] && resp['status'] != 'Fail') {
              let items = resp['itemList'];
              this.serialNumbers.push(value);
              for (let idx in this.itemLists) {
                if (items[0]['modelNumber'].toUpperCase() == this.itemLists[idx]['modelNumber'].toUpperCase()) {
                  if (!this.itemLists[idx]['isScanned']) {
                    this.itemLists[idx]['scanCount']++;
                    this.orderscanning.controls['serialNo_' + index].disable();
                    this.orderscanning.controls['modelNo_' + index].setValue(items[0]['modelNumber']);
                    this.orderscanning.controls['binLoc_' + index].setValue(items[0]['containerNumber'] + '/ ' + items[0]['binLocation']);
                    console.log(this.orderscanning);
                    if (this.itemCount.length > index) {
                      setTimeout(() => {
                        this.serialInputs.toArray()[index].setFocus();
                      }, 300);
                    }
                    if (this.itemLists[idx]['scanCount'] == this.itemLists[idx]['quantity']) {
                      this.itemLists[idx]['isScanned'] = true;
                    }
                    for (let idx of this.itemCount) {
                      if (this.orderscanning.controls['modelNo_' + idx].value != '' && this.orderscanning.controls['modelNo_' + idx].value != null &&
                        this.orderscanning.controls['serialNo_' + idx].value != '' && this.orderscanning.controls['serialNo_' + idx].value != null &&
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
                        this.orderScanSubmit();
                      }
                    }
                  } else {
                    if (this.itemLists[idx]['isScanned']) {
                      this.ecoFlexService.PresentToast(this.message[4], "danger");
                      this.eventLog = 'Serial number ' + value + ' already scanned \n' + this.eventLog;
                      evt.target.value = '';
                      break;
                    }
                  }
                }
                //  else {
                //   temp++;
                // }
              }
            } else {
              this.ecoFlexService.PresentToast(resp['message'], "danger");
              evt.target.value = '';
              this.eventLog = 'Serial Number ' + value + resp['message'] + ' \n' + this.eventLog;
              setTimeout(() => {
                this.serialInputs.toArray()[index - 1].setFocus();
              }, 300);
            }
            // this.ecoFlexService.dismiss();
          }).catch(err => {
            console.log(err);
          })
          // if (temp >= this.itemLists.length) {
          //   this.ecoFlexService.PresentToast(this.message[5], "danger");
          //   this.eventLog = 'Model number ' + value + ' is invalid \n' + this.eventLog;
          //   evt.target.value = '';
          // }
          // this.ecoFlexService.dismiss();
        } else {
          this.ecoFlexService.PresentToast('Invalid serial number', "danger");
          evt.target.value = '';
          this.eventLog = 'Serial Number ' + value + ' is invalid' + ' \n' + this.eventLog;
          setTimeout(() => {
            this.serialInputs.toArray()[index - 1].setFocus();
          }, 300);
        }
      } else if (value != "" && value != null){
        for (let idx in this.itemLists) {
          if (value == this.itemLists[idx]['modelNumber']) {
            if (!this.itemLists[idx]['isScanned']) {
              this.itemLists[idx]['scanCount']++;
              this.orderscanning.controls['modelNo_' + index].disable();
              setTimeout(() => {
                this.containerInputs.toArray()[index - 1].setFocus();
              }, 300);
              if (this.itemLists[idx]['scanCount'] == this.itemLists[idx]['quantity']) {
                this.itemLists[idx]['isScanned'] = true;
              }
            } else {
              if (this.itemLists[idx]['isScanned']) {
                this.ecoFlexService.PresentToast(this.message[4], "danger");
                this.eventLog = 'Model number ' + value + ' already scanned \n' + this.eventLog;
                evt.target.value = '';
                break;
              }
            }
          } else {
            temp++;
          }
        }
        if (temp >= this.itemLists.length) {
          this.ecoFlexService.PresentToast(this.message[5], "danger");
          this.eventLog = 'Model number ' + value + ' is invalid \n' + this.eventLog;
          evt.target.value = '';
        }
      }
      // }
    }, 300);
  }

  //Method to scan container & bin location
  handleItemScanner(type, index) {
    let valid;
    setTimeout(() => {

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
          this.orderScanSubmit();
        }
      }

    }, 300);
  }

  //Method to enable/disable auto save
  isChecked(check) {
    if (check == true) {
      this.autoSave = true;
    } else {
      this.autoSave = false;
    }
  }

  //Method to submit order scan
  orderScanSubmit() {
    let items = [], itemLists:any = JSON.parse(JSON.stringify(this.itemLists));
    itemLists.map(item => {
      if (item['quantity'] == 1) {
        for (let idx of this.itemCount) {
          if (item['modelNumber'].toUpperCase() == this.orderscanning.controls['modelNo_' + idx].value.toUpperCase()) {
            if (this.new) {
              let val = this.orderscanning.controls['binLoc_' + idx].value.split('/');
              item['containerNumber'] = val[0];
              item['binLocation'] = val[1].trim();
              item['serialNumber'] = this.orderscanning.controls['serialNo_' + idx].value;
            } else {
              item['containerNumber'] = this.orderscanning.controls['container_' + idx].value;
              item['binLocation'] = this.orderscanning.controls['binLoc_' + idx].value;
            }
          }
        }
      } else {
        items.push(item);
        item['delete'] = true;
      }
    })
    //Remove multiple qty items
    for (let i = itemLists.length - 1; i >= 0; i--) {
      if (itemLists[i]['delete']) {
        itemLists.splice(i, 1);
      }
    }
    //Split multiple qty items into individual 
    items.map(item => {
      for (let i of this.itemCount) {
        if (item['modelNumber'].toUpperCase() == this.orderscanning.controls['modelNo_' + i].value.toUpperCase()) {
          if (this.new) {
            let val = this.orderscanning.controls['binLoc_' + i].value.split('/');
            itemLists.push({
              serialNumber: this.orderscanning.controls['serialNo_' + i].value,
              containerNumber: val[0],
              binLocation: val[1].trim(),
              isScanned: item['isScanned'],
              itemId: item['itemId'],
              quantity: 1
            })
          } else {
            itemLists.push({
              modelNumber: this.orderscanning.controls['modelNo_' + i].value,
              containerNumber: this.orderscanning.controls['container_' + i].value,
              binLocation: this.orderscanning.controls['binLoc_' + i].value,
              isScanned: item['isScanned'],
              itemId: item['itemId'],
              quantity: 1
            })
          }
        }
      }
    })

    var savescanorder = this.ecoFlexService.baseUrl + this.ecoFlexService.saveorderScanold;
    let jsonobj = {
      "orderNumber": this.orderscanning.controls['order'].value.trim(),
      "orderId": this.orderid,
      "customerName": this.custName,
      "itemList": itemLists,
      "isNewScreen": this.new ? true : false
    }
    console.log(jsonobj);
    console.log(this.itemLists);
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(savescanorder, "post", jsonobj).then(resp => {
      if (resp['status'] == 'Success') {
        this.ecoFlexService.PresentToast(resp['message'], "success");
        this.eventLog = 'Order# ' + this.orderscanning.controls['order'].value.trim() + ' ' + resp['message'] + ' \n' + this.eventLog;
        this.clearForm();
      } else {
        this.eventLog = 'Order# ' + this.orderscanning.controls['order'].value.trim() + ' ' + resp['message'] + ' \n' + this.eventLog;
        this.ecoFlexService.PresentToast(resp['message'], "danger");
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
        if (item['modelNumber'].toUpperCase() == value.toUpperCase()) {
          item['scanCount']--;
          if (item['quantity'] != item['scanCount']) {
            item['isScanned'] = false;
          }
          break;
        }
      }
      if (this.new) {
        this.serialNumbers.map((item, i) => {
          if (item == this.orderscanning.controls['serialNo_' + idx].value) {
            this.serialNumbers.splice(i, 1);
          }
        })
        this.orderscanning.controls['serialNo_' + idx].enable();
        this.orderscanning.controls['serialNo_' + idx].reset();
      } else {
        this.orderscanning.controls['container_' + idx].enable();
        this.orderscanning.controls['container_' + idx].reset();
      }
      this.orderscanning.controls['modelNo_' + idx].enable();
      this.orderscanning.controls['binLoc_' + idx].enable();

      this.orderscanning.controls['modelNo_' + idx].reset();
      this.orderscanning.controls['binLoc_' + idx].reset();
      setTimeout(() => {
        if (this.new) {
          this.serialInputs.toArray()[idx - 1].setFocus();
        } else {
          this.modelInputs.toArray()[idx - 1].setFocus();
        }
      }, 300);
    } else {
      if (this.new) {
        this.orderscanning.controls['serialNo_' + idx].enable();
        this.orderscanning.controls['serialNo_' + idx].reset();
        this.orderscanning.controls['serialNo_' + idx].setValue(' ');
      } else {
        this.orderscanning.controls['container_' + idx].enable();
        this.orderscanning.controls['container_' + idx].reset();
      }
      this.orderscanning.controls['modelNo_' + idx].enable();
      this.orderscanning.controls['binLoc_' + idx].enable();

      this.orderscanning.controls['modelNo_' + idx].reset();
      this.orderscanning.controls['binLoc_' + idx].reset();
      setTimeout(() => {
        if (this.new) {
          this.serialInputs.toArray()[idx - 1].setFocus();
        } else {
          this.modelInputs.toArray()[idx - 1].setFocus();
        }
      }, 300);
    }
  }
}
