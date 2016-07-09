import { Component } from '@angular/core';
import { NavController, Loading, MenuController, Alert, Storage, LocalStorage } from 'ionic-angular';
import { JwtHelper } from 'angular2-jwt';
import * as moment from 'moment';

import { TabsPage } from '../tabs/tabs';
import { Login } from '../../providers/login/login';
import { Configure } from '../../providers/configure/configure';

@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [Login, Configure, JwtHelper]
})

export class LoginPage {

  token;
  username;
  password;
  localStorage;

  constructor(
    private LoginService: Login,
    private nav: NavController,
    private menu: MenuController,
    private config: Configure,
    private jwtHelper: JwtHelper
  ) {
    this.menu.enable(false, 'loggedInMenu');
    this.jwtHelper = new JwtHelper();   
    this.localStorage = new Storage(LocalStorage);
    
    // let ciphertext = cryptojs.AES.encrypt('my message', 'secret key 123');
    // console.log(ciphertext.toString());
  }

  goHome() {
    this.nav.push(TabsPage)
  }

  doLogin() {
    let url = this.config.getUrl();
    // console.log(this.username);
    // console.log(this.password);
    // url = `${url}`
    let loading = Loading.create({
      content: 'Please wait...'
    });
    
    this.nav.present(loading);

    this.LoginService.login(url, this.username, this.password)
      .then(data => {
        if (data.ok) {
          this.token = data.token;
          let decodeToken = this.jwtHelper.decodeToken(this.token);
          // console.log(decodeToken);
          // localStorage.setItem('token', this.token);
          // localStorage.setItem('fullname', decodeToken.fullname);
          // localStorage.setItem('exp', decodeToken.exp);

          this.localStorage.set('token', this.token);
          this.localStorage.set('fullname', decodeToken.fullname);
          this.localStorage.set('memberId', decodeToken.memberId);
          
          loading.dismiss();
          this.nav.push(TabsPage);

        } else {
          //
          let alert = Alert.create({
            title: 'เกิดข้อผิดพลาด',
            subTitle: data.msg,
            buttons: ['ตกลง']
          });
          loading.dismiss();
          this.nav.present(alert);
        }
        

      });
  }
}
