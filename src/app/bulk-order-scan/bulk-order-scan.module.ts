import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BulkOrderScanPageRoutingModule } from './bulk-order-scan-routing.module';

import { BulkOrderScanPage } from './bulk-order-scan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    BulkOrderScanPageRoutingModule
  ],
  declarations: [BulkOrderScanPage]
})
export class BulkOrderScanPageModule {}
