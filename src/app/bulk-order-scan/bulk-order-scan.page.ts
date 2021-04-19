import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ApiserviceService } from '../apiservice.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-order-scan',
  templateUrl: './bulk-order-scan.page.html',
  styleUrls: ['./bulk-order-scan.page.scss'],
})
export class BulkOrderScanPage implements OnInit {
  public bulkorderscan: FormGroup;
  @ViewChild('order', { static: false }) order;
  @ViewChild('serial', { static: false }) serial;

  customer: any;
  itemList: any;
  selectedItem: any;
  serialNumber: any[] = [];
  orderId: any;
  scannedItems: any[] = [];
  enbaleAutoSave = false;
  enableSaveBtn = false;
  eventLog: any;
  constructor(
    private formBuilder: FormBuilder,
    private ecoFlexService: ApiserviceService,
    private alertCrtl: AlertController,
    private routeto: Router
  ) {
    this.bulkorderscan = this.formBuilder.group({
      order: ['', Validators.required],
      serial: ['']
    });
  }

  ngOnInit() {
  }

  goToback() {
    this.routeto.navigate(['/menus']);
  }

  checkAutoSave() {
    if (this.enbaleAutoSave == true) {
      this.enableSaveBtn = false
    } else {
      this.enableSaveBtn = true
    }
  }

  orderScan() {
    let value = this.bulkorderscan.controls['order'].value;
    this.orderSearch(value);
  }

  handleOrderScanner(event) {
    let value = this.bulkorderscan.controls['order'].value;
    setTimeout(() => {
      this.orderSearch(value)
    }, 300)
  }

  orderSearch(value) {
    let ordervalue = value.toUpperCase()
    let url = this.ecoFlexService.baseUrl + this.ecoFlexService.getOrderScan
    let data = {
      "OrderNumber": ordervalue
    }
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(url, "post", data).then(res => {
      if (res['status'] == 'Success') {
        this.orderId = res['orderId']
        this.customer = res['customerName']
        this.itemList = res['itemList']
        for (let item of this.itemList) {
          item.scanCount = 0
        }
        this.eventLog = 'Order # ' + ordervalue + ' is successfully scanned \n';
        this.ecoFlexService.dismiss();
      } else {
        this.ecoFlexService.dismiss();
        this.eventLog = res['message'] + '\n' + this.eventLog;
        this.ecoFlexService.PresentToast(res['message'], 'danger');
      }
    }).catch(err => {
      this.ecoFlexService.dismiss();
      this.ecoFlexService.PresentToast('Unable to reach server', 'danger');
    })
  }

  checkItem(item) {
    item.selected = true
    this.selectedItem = item.itemId
    if (this.selectedItem) {
      this.serial.setFocus();
    }
  }

  handleSerialScanner(event) {
    let value = event.target.value.toUpperCase();
    if (value && /^[0-9]+$/.test(value)) {
      let url = this.ecoFlexService.baseUrl + this.ecoFlexService.serialVerify
      let data = {
        "OrderId": this.orderId,
        "SerialNumber": value
      }
      this.ecoFlexService.present();
      this.ecoFlexService.ajaxCallService(url, "post", data).then(res => {
        console.log(res);
        if (!res['error'] && res['status'] != 'Fail') {
          this.ecoFlexService.dismiss();
          let items = res['itemList']
          if (this.selectedItem) {
            for (let item of this.itemList) {
              if (items[0].modelNumber == item.modelNumber && items[0].itemId == this.selectedItem) {
                if (!item.isScanned) {
                  if (item.quantity > item.scanCount) {
                    item.scanCount++;
                    let checkDuplicate = this.serialNumber.includes(value);
                    if (checkDuplicate) {
                      this.confirmationAlert(value)
                    } else {
                      this.serialNumber.push(value)
                    }
                    if (item.quantity == item.scanCount) {
                      item.isScanned = true
                      item.selected = false
                      for (let scan of this.scannedItems) {
                        if (scan.modelNumber == items[0].modelNumber) {
                          scan.isScanned = true
                        }
                      }
                    }
                  }
                  this.bulkorderscan.controls['serial'].reset();
                  setTimeout(() => {
                    this.serial.setFocus()
                  }, 200);
                  this.scannedItems.push({
                    serialNumber: value,
                    modelNumber: items[0].modelNumber,
                    containerNumber: items[0].containerNumber,
                    binLocation: items[0].binLocation,
                    isScanned: item['isScanned'],
                    itemId: item['itemId'],
                    quantity: 1,
                    isNewScreen: true
                  })
                }else{
                  this.ecoFlexService.PresentToast('All quantities are scanned for this item', 'danger')
                }
              }
              let checkComplete = this.itemList.filter(item => item.quantity > item.scanCount)
              if (checkComplete.length == 0) {
                if (!this.enbaleAutoSave) {
                  this.enableSaveBtn = true
                } else if (this.enbaleAutoSave) {
                  setTimeout(() => {
                    this.orderSubmit()
                  }, 200);
                }
              }
            }
          } else {
            this.eventLog = 'No item has been selected. Please select one item \n' + this.eventLog
            this.ecoFlexService.PresentToast('No item has been selected. Please select one item', "danger")
          }
        }else{
          this.ecoFlexService.dismiss();
          this.ecoFlexService.PresentToast(res['message'], 'danger');
          this.eventLog = res['message']+'\n' + this.eventLog
        }
      })
    } else {
      this.ecoFlexService.dismiss();
      this.eventLog = 'Invalid serial number \n' + this.eventLog
      this.ecoFlexService.PresentToast('Invalid serial number', 'danger');
    }
  }

  orderSubmit() {
    let url = this.ecoFlexService.baseUrl + this.ecoFlexService.saveorderScanold
    let data = {
      "orderNumber": this.bulkorderscan.controls['order'].value.trim(),
      "orderId": this.orderId,
      "customerName": this.customer,
      "itemList": this.scannedItems,
    }
    this.ecoFlexService.present();

    this.ecoFlexService.ajaxCallService(url, "post", data).then(res => {
      if (res['status'] == 'Success') {
        this.ecoFlexService.PresentToast(res['message'], "success");
        this.eventLog = 'Order# ' + this.bulkorderscan.controls['order'].value.trim() + ' ' + res['message'] + ' \n' + this.eventLog;
        this.clearForm();
      } else {
        this.eventLog = 'Order# ' + this.bulkorderscan.controls['order'].value.trim() + ' ' + res['message'] + ' \n' + this.eventLog;
        this.ecoFlexService.PresentToast(res['message'], "danger");
      }
      this.ecoFlexService.dismiss();
      console.log(res);
    }).catch(err => {
      this.ecoFlexService.dismiss();
    })
  }

  async confirmationAlert(value) {
    let alert = await this.alertCrtl.create({
      message: "Serial # " + value + " is already scanned. Do you want to unscan this serial #?",
      buttons: [
        {
          text: "NO",
          handler: () => { }
        },
        {
          text: "YES",
          handler: () => {
            for (let item of this.itemList) {
              if (item.itemId == this.selectedItem) {
                item.scanCount--;
              }
            }
            this.scannedItems.pop();
            console.log(this.scannedItems);
          }
        }
      ]
    });
    alert.present();
  }

  clearForm() {
    this.bulkorderscan.reset();
    this.itemList = [];
    this.scannedItems = [];
    this.serialNumber = [];
    this.customer = null
  }

}
