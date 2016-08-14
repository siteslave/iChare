import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {SpinnerDialog, Toast, SecureStorage} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Drug} from '../../providers/drug/drug';

import * as _ from 'lodash';
import * as moment from 'moment';

interface rowResults {
  screen_date?: any,
  screen_time?: any,
  drug_name?: any,
  qty?: any,
  name1?: any,
  name2?: any,
  name3?: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/drug/drug.html',
  providers: [Encrypt, Configure, Drug]
})
export class DrugPage implements OnInit {
  url;
  drugs;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private drug: Drug
  ) {

    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });    
  }

  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...')
    
    let url = `${this.url}/api/drug/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        this.drugs = [];
        this.drug.getHistory(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);

            let rows = jsonData;

            for (let row of rows) {
              let drugData = <rowResults>row;
              drugData.screen_date = `${moment(row.screen_date).format('DD/MM')}/${moment(row.screen_date).get('year') + 543}`;
              drugData.screen_time = moment(row.screen_time, 'HH:mm:ss').format('HH:mm');
              drugData.drug_name = row.drug_name;
              drugData.qty = row.qty;
              drugData.name1 = row.name1;
              drugData.name2 = row.name2;
              drugData.name3 = row.name3;

              this.drugs.push(drugData);
            }
            
            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย', '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            Toast.show('เกิดข้อผิดพลาด', '3000', 'center')
              .subscribe(toast => { });
          });
      });
        
  }

}
