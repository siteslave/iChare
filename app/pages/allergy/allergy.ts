import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import {SecureStorage, SpinnerDialog, Toast} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Allergy} from '../../providers/allergy/allergy';
import * as _ from 'lodash';

interface encryptData {
  data: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/allergy/allergy.html',
  providers: [Encrypt, Configure, Allergy]
})
export class AllergyPage implements OnInit {

  url;
  localStorage;
  allergies;
  hasData: boolean = false;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private allergy: Allergy,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
    
    this.url = config.getUrl();
  }

  ngOnInit() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...');
    
    let url = `${this.url}/api/allergy/info`;
  
    this.allergies = [];

    this.secureStorage.get('data')
      .then((sessionData) => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        console.log(this.sessionData);
        
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        return this.allergy.getAllergy(url, this.sessionData.memberId, _encryptedParams);
      })

      .then(data => {
        let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
        let _decryptedText = <string>decryptedText;

        let jsonData = JSON.parse(_decryptedText);
        let rows = <Array<any>>jsonData;
        for (let row of rows) {
          this.allergies.push(row);
        }

        if (this.allergies.length) {
          this.hasData = true;
        } else {
          this.hasData = false;
        }

        SpinnerDialog.hide();
           
      }, err => {
        Toast.show('เกิดข้อผิดพลาด', '3000', 'center').subscribe(() => { });
      });
    
    
  }

}
