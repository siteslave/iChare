import { Component } from '@angular/core';
import { Platform, NavController, LoadingController, MenuController, AlertController, Storage, LocalStorage } from 'ionic-angular';
import { JwtHelper } from 'angular2-jwt';
import * as moment from 'moment';
import {Push, Badge, Toast, SecureStorage, SpinnerDialog, Dialogs } from 'ionic-native';

import { TabsPage } from '../tabs/tabs';
import { WelcomePage } from '../../pages/welcome/welcome';
import { Login } from '../../providers/login/login';
import { Configure } from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

interface httpResult {
  ok: boolean,
  msg?: string,
  memberId?: string,
  data?: any
}

interface DecryptedData {
  token?: any,
  sessionKey?: any,
  key?: any,
  fullname?: any
}

interface AdditionalData {
  key?: any
}

// interface AdditionalDataSummary {
//   key?: any
// }

@Component({
  templateUrl: 'build/pages/login/login.html',
  providers: [Login, Configure, JwtHelper, Encrypt]
})

export class LoginPage {

  token;
  username;
  password;
  localStorage;
  secureStorage: SecureStorage; 
  masterKey;
  isSuccess: boolean = false;

  constructor(
    private login: Login,
    private nav: NavController,
    private menu: MenuController,
    private config: Configure,
    private jwtHelper: JwtHelper,
    private encrypt: Encrypt,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private platform: Platform
  ) {
    this.menu.enable(false, 'loggedInMenu');
    this.jwtHelper = new JwtHelper();   
    // this.localStorage = new Storage(LocalStorage);
    this.secureStorage = new SecureStorage();

    this.masterKey = this.config.getMasterKey();

    this.secureStorage.create('iChare')
      .then(
      () => console.log('Storage is ready!'),
      error => console.log(error)
      );
    // let ciphertext = cryptojs.AES.encrypt('my message', 'secret key 123');
    // console.log(ciphertext.toString());

  }

  doLogin() {

    let _navCtrl = this.nav;
    let _encrypt = this.encrypt;
    let _masterKey = this.masterKey;
    let _login = this.login;

    let url = this.config.getUrl();
    // console.log(this.username);
    // console.log(this.password);
    // url = `${url}`
    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    
    // loading.present();

    SpinnerDialog.show('', 'กรุณารอซักครู่...');
    let _encryptedParams = this.encrypt.encrypt({ username: this.username, password: this.password }, this.masterKey)
    
    this.login.login(url, _encryptedParams)
      .then(data => {
        let result = <httpResult>data;
        if (result.ok) {
          
          SpinnerDialog.hide();
          // alert(JSON.stringify(result));

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

          SpinnerDialog.show('', 'Registering device...');

          push.on('registration', (res) => {
            let _encryptedParams = this.encrypt.encrypt({ deviceToken: res.registrationId, memberId: result.memberId }, this.masterKey)
            this.login.saveDevicetoken(url, _encryptedParams)
              .then(() => {
                let _sessionParams = this.encrypt.encrypt({ memberId: result.memberId }, this.masterKey)
                this.login.getSessionKey(url, _sessionParams)
                  .then(_res => {
                    SpinnerDialog.hide();
                    SpinnerDialog.show('', 'Wating for Session Key...');
                  });
              });
          });

          push.on('notification', (data) => {

            let additionalData = <AdditionalData>data.additionalData;
            
            if (additionalData.key) {
              SpinnerDialog.hide();
              this.nav.setRoot(WelcomePage, { params: data.additionalData });
            } else {
              SpinnerDialog.hide();
              console.log('No action for session key');
            }
           
          });
          
        } else {
   
          // loading.dismiss();
          SpinnerDialog.hide();
          Toast.show('เกิดข้อผิดพลาด : ' + JSON.stringify(result.msg), '3000', 'center').subscribe(toast => { });
        }
        

      });


  }
}
