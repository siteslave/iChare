import { Component, OnInit } from '@angular/core';
import {ModalController, Platform, NavController, NavParams, ViewController } from 'ionic-angular';

import { BarcodeScanner, SpinnerDialog, Toast, SecureStorage } from 'ionic-native';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

interface HttpResult {
  ok?: any,
  img?: any,
  msg?: any
}

@Component({
  templateUrl: 'build/pages/barcode/barcode.html',
  providers: [Configure, Settings, Encrypt]
})
  
export class BarcodePage implements OnInit {
  url: any;
  token: any;
  hashKey: any;
  barcode: any;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private viewCtrl: ViewController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform,
    private navParams: NavParams
  ) {

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
    
  }

  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...');
    
    this.hashKey = this.navParams.get('hashKey'); 

    this.url = this.config.getUrl();
    // console.log(this.hashKey);
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, hashKey: this.hashKey };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        
        let url = `${this.url}/api/patient/get-barcode`;
      
        return this.settings.getBarCode(url, this.sessionData.memberId, _encryptedParams);
      })
      .then(img => {
        this.barcode = img;
        SpinnerDialog.hide();
      }, err => {
        console.log(err);
        SpinnerDialog.hide();
      });
    
  }

}
