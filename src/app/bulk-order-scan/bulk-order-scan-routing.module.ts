import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BulkOrderScanPage } from './bulk-order-scan.page';

const routes: Routes = [
  {
    path: '',
    component: BulkOrderScanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BulkOrderScanPageRoutingModule {}
