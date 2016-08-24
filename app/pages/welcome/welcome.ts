import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { SpinnerDialog, SecureStorage } from 'ionic-native';
import { TabsPage } from '../tabs/tabs';

import {Encrypt} from '../../providers/encrypt/encrypt';
import {Configure} from '../../providers/configure/configure';

interface DecryptedData {
  token?: string,
  sessionKey?: string,
  fullname?: string
}

@Component({
  templateUrl: 'build/pages/welcome/welcome.html',
  providers: [Encrypt, Configure]
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
    private config: Configure
  ) {
    this.params = this.navParams.get('params');

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
  }

  ngOnInit() {
        
    this.masterKey = this.config.getMasterKey();
  
    let decryptedParams = this.encrypt.decrypt(this.params.key, this.masterKey)
    let data = <string>decryptedParams;
    let _params = JSON.parse(data);
    this.fullname = _params.fullname;
    this.token = _params.token;
    this.sessionKey = _params.sessionKey;
    this.memberId = _params.memberId;

    let _sessionData = { token: this.token, sessionKey: this.sessionKey, fullname: this.fullname, memberId: this.memberId };
    this.secureStorage.set('data', JSON.stringify(_sessionData)).then(() => { });

    SpinnerDialog.hide();
  }  

  goHome() {
    SpinnerDialog.show('', 'กรุณารอซักครู่..');
    setTimeout(function () {
      SpinnerDialog.hide();
    }, 700);
    this.navCtrl.setRoot(TabsPage);
  }

}
