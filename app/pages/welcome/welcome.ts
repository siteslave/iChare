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

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private encrypt: Encrypt,
    private config: Configure) {
    this.params = this.navParams.get('params');

    // alert(JSON.stringify(this.params));

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
    

    // this.fullname = 'Satit Rianpit';

  }

  ngOnInit() {
        
    this.masterKey = this.config.getMasterKey();
  
    this.encrypt.decrypt(this.params.key, this.masterKey)
      .then(decryptedParams => {
        let data = <string>decryptedParams;
        let _params = JSON.parse(data);
        // console.log(_params);

        // alert(data.sessionKey);

        // alert(_params.fullname);
        this.fullname = _params.fullname;
        this.token = _params.token;
        this.sessionKey = _params.sessionKey;
      });
  }  

  goHome() {
    SpinnerDialog.show('Loading', 'Please wait..');
    setTimeout(function () {
      SpinnerDialog.hide();
    }, 1000);
    this.navCtrl.setRoot(TabsPage);
  }

}
