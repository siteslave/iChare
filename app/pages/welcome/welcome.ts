import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { SpinnerDialog, SecureStorage } from 'ionic-native';
import { TabsPage } from '../tabs/tabs';

import {JwtHelper} from 'angular2-jwt';

import {Encrypt} from '../../providers/encrypt/encrypt';
import {Configure} from '../../providers/configure/configure';

interface DecryptedData {
  token?: string,
  sessionKey?: string,
  fullname?: string
}

@Component({
  templateUrl: 'build/pages/welcome/welcome.html',
  providers: [Encrypt, Configure, JwtHelper]
})
export class WelcomePage implements OnInit {
  token;
  sessionKey;
  fullname;
  params;
  secureStorage: SecureStorage;
  masterKey;
  memberId;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private encrypt: Encrypt,
    private config: Configure,
    private jwtHelper: JwtHelper
  ) {
    this.params = this.navParams.get('params');

    // alert(JSON.stringify(this.params));

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
    

    // this.fullname = 'Satit Rianpit';

  }

  ngOnInit() {
        
    this.masterKey = this.config.getMasterKey();
  
    let decryptedParams = this.encrypt.decrypt(this.params.key, this.masterKey)
    let data = <string>decryptedParams;
    let _params = JSON.parse(data);
        // console.log(_params);

        // alert(data.sessionKey);

        // alert(_params.fullname);
    this.fullname = _params.fullname;
    this.token = _params.token;
    this.sessionKey = _params.sessionKey;
    this.memberId = _params.memberId;
    

        // decode token 
        // let _decodedToken = this.jwtHelper.decodeToken(this.token);
    
    let _sessionData = { token: this.token, sessionKey: this.sessionKey, fullname: this.fullname, memberId: this.memberId };

    this.secureStorage.set('data', JSON.stringify(_sessionData)).then(() => { });
    // this.secureStorage.set('sessionKey', this.sessionKey).then(() => { });
    // this.secureStorage.set('memberId', this.sessionKey).then(() => { });
  }  

  goHome() {
    SpinnerDialog.show('Loading', 'Please wait..');
    setTimeout(function () {
      SpinnerDialog.hide();
    }, 1000);
    this.navCtrl.setRoot(TabsPage);
  }

}
