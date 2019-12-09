import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderscanningPageRoutingModule } from './orderscanning-routing.module';

import { OrderscanningPage } from './orderscanning.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OrderscanningPageRoutingModule
  ],
  declarations: [OrderscanningPage]
})
export class OrderscanningPageModule { }
