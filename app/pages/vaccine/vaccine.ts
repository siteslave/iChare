import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {SpinnerDialog, Toast, SecureStorage} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Vaccine} from '../../providers/vaccine/vaccine';
import * as _ from 'lodash';
import * as moment from 'moment';

interface VaccineData {
  vaccine_code: any,
  vaccine_name: any,
  vstdate: any,
  vsttime: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/vaccine/vaccine.html',
  providers: [Vaccine, Configure, Encrypt]
})
export class VaccinePage implements OnInit {

  isAndroid: boolean = false;
  url;
  localStorage;
  vaccines;
  hasData: boolean = false;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private vaccine: Vaccine
  ) {
    this.isAndroid = this.platform.is('android');
    this.url = this.config.getUrl();

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
  }

  ngOnInit() {
    
    SpinnerDialog.show('', 'กรุณารอซักครู่...')
    let url = `${this.url}/api/vaccine/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
          
        this.vaccines = [];
        this.vaccine.getHistory(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            
            let rowsHistories = <Array<any>>jsonData;

            for (let row of rowsHistories) {
              let data = <VaccineData>row;
              data.vaccine_code = row.vaccine_code;
              data.vaccine_name = row.vaccine_name;
              data.vstdate = `${moment(row.vstdate).format('DD/MM')}/${moment(row.vstdate).get('year') + 543}`;
              data.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');

              this.vaccines.push(data);
            }
            
            if (this.vaccines.length) {
              this.hasData = true;
            } else {
              this.hasData = false;
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
