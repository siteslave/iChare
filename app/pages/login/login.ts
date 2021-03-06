import { Component } from '@angular/core';
import { NavController, Loading, MenuController, Alert, Storage, LocalStorage } from 'ionic-angular';
import { JwtHelper } from 'angular2-jwt';
import * as moment from 'moment';
import {Push, Badge} from 'ionic-native';

import { TabsPage } from '../tabs/tabs';
import { Login } from '../../providers/login/login';
import { Configure } from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

interface httpResult {
  ok: boolean,
  msg?: string,
  token?: any
}

@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [Login, Configure, JwtHelper, Encrypt]
})

export class LoginPage {

  token;
  username;
  password;
  localStorage;

  constructor(
    private login: Login,
    private nav: NavController,
    private menu: MenuController,
    private config: Configure,
    private jwtHelper: JwtHelper,
    private encrypt: Encrypt
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
    let params = this.encrypt.encrypt({ username: this.username, password: this.password });
    this.login.login(url, params)
      .then(data => {
        let result = <httpResult>data;
        if (result.ok) {
          this.token = result.token;
          let decodeToken = this.jwtHelper.decodeToken(this.token);
          // console.log(decodeToken);
          // localStorage.setItem('token', this.token);
          // localStorage.setItem('fullname', decodeToken.fullname);
          // localStorage.setItem('exp', decodeToken.exp);

          this.localStorage.set('token', this.token);
          this.localStorage.set('fullname', decodeToken.fullname);
          this.localStorage.set('memberId', decodeToken.memberId);

          // loading.dismiss();
          // this.nav.push(TabsPage);
          
          let push = Push.init({
            android: {
              senderID: "238355712119"
            },
            ios: {
              alert: "true",
              badge: true,
              sound: 'false'
            },
            windows: {}
          });

          push.on('registration', (res) => {
            let params = this.encrypt.encrypt({ deviceToken: res.registrationId });
            this.login.saveDevicetoken(url, this.token, params)
              .then(() => {
                // console.log(Badge.hasPermission());
                loading.dismiss();
                this.nav.push(TabsPage);
              }, err => {
                let alert = Alert.create({
                    title: 'เกิดข้อผิดพลาด',
                    subTitle: `Error [${err.status}]: ${err.statusText} `,
                    buttons: ['ตกลง']
                  });

                  loading.dismiss();
                  this.nav.present(alert);
              });
          });

          push.on('notification', (data) => {
            // get notification
            console.log(data);
          });
          
        } else {
          //
          let alert = Alert.create({
            title: 'เกิดข้อผิดพลาด',
            subTitle: JSON.stringify(result.msg),
            buttons: ['ตกลง']
          });
          loading.dismiss();
          this.nav.present(alert);
        }
        

      });
  }
}
