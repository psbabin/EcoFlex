import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiserviceService } from '../apiservice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('usermailid', { static: false }) usermailid;
  @ViewChild('userpaswrd', { static: false }) userpswrd;
  public logingrp: FormGroup;
  router: any;
  errUserName: boolean;
  errPassword: boolean;
  message: string;
  constructor(
    private formBuilder: FormBuilder,
    private routeTo: Router,
    private ecoFlexService: ApiserviceService
  ) {
    this.logingrp = this.formBuilder.group({
      userEmail: [''],
      userPwd: [''],
    });
  }

  ngOnInit() {
    this.errPassword = false;
    this.errUserName = false;
  }

  ionViewDidEnter() {
    this.message = JSON.parse(localStorage.getItem(("Message")));
    console.log("message", this.message)
    let id = localStorage.getItem("userName");
    this.logingrp.reset();
    if (id != undefined && id != null && id != "") {
      this.logingrp.controls['userEmail'].setValue(id);
      this.logingrp.controls['userPwd'].reset();
      setTimeout(() => {
        this.userpswrd.setFocus();
      }, 700);
    } else {
      setTimeout(() => {
        this.usermailid.setFocus();
      }, 700);
    }
  }


  btnLogin() {
    var loginUrl = this.ecoFlexService.baseUrl + this.ecoFlexService.userLogin;
    if (this.logingrp.value.userEmail == undefined || this.logingrp.value.userEmail == "") {
      this.errUserName = true;
      return false;
    } else {
      this.errUserName = false;
    }
    if (this.logingrp.value.userPwd == undefined || this.logingrp.value.userPwd == "") {
      this.errPassword = true;
      return false;
    } else {
      this.errPassword = false;
    }
    var dataParam = {
      "LoginId": this.logingrp.value.userEmail,
      "Password": this.logingrp.value.userPwd
    }
    let userName = this.logingrp.value.userEmail;
    this.ecoFlexService.present();
    this.ecoFlexService.ajaxCallService(loginUrl, "post", dataParam).then(resp => {
      console.log("hai", resp);
      if (resp['status'] == "Success") {
        localStorage.setItem("Id", JSON.stringify(resp['userId']));
        localStorage.setItem("userName", userName);
        this.routeTo.navigate(["/menus"]);
        this.errPassword = false;
      } else {
        this.ecoFlexService.PresentToast(resp['message'], 'danger');
      }

      this.ecoFlexService.dismiss();
    }).catch(err => {
      this.ecoFlexService.PresentToast('Unable to reach server, Please try again', 'danger');
      this.ecoFlexService.dismiss();
    });
  }

  //check if model is empty
  checkEmptyIdOnFocus(evt) {
    if (evt.target.value != undefined && evt.target.value != "") {
      this.errUserName = false;
    }
  }

  //check if model is empty
  checkEmptyIdOnBlur(evt) {
    if (evt.target.value != undefined && evt.target.value != "") {
      this.errUserName = false;
    } else {
      this.errUserName = true;
    }
  }

  //check if model is empty
  checkEmptyPassOnFocus(evt) {
    if (evt.target.value != undefined && evt.target.value != "") {
      this.errPassword = false;
    }
  }

  //check if model is empty
  checkEmptyPassOnBlur(evt) {
    if (evt.target.value != undefined && evt.target.value != "") {
      this.errPassword = false;
    } else {
      this.errPassword = true;
    }
  }
}
