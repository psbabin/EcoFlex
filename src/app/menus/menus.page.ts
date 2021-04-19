import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.page.html',
  styleUrls: ['./menus.page.scss'],
})
export class MenusPage implements OnInit {

  constructor(
    private routeto: Router,
    private ecoFlexService: ApiserviceService
  ) { }

  ngOnInit() {
    let id = JSON.parse(localStorage.getItem("Id"));
  }
  gotoHomePage() {
    this.routeto.navigate(["/login"]);
  }
  gotoOrderPage() {
    this.routeto.navigate(["/orderscanning"]);
  }
  gotoBulkorder(){
    this.routeto.navigate(['/bulk-order-scan']);
  }

}
