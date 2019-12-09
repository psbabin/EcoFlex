import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderscanningPage } from './orderscanning.page';

const routes: Routes = [
  {
    path: '',
    component: OrderscanningPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderscanningPageRoutingModule {}
