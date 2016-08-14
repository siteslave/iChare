import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SpinnerDialog, Toast, SecureStorage } from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Dashboard} from '../../providers/dashboard/dashboard';
import {BloodPressurePage} from '../blood-pressure/blood-pressure';
import {BmiPage} from '../bmi/bmi';
import {PulsePage} from '../pulse/pulse';
import {ScreenNotePage} from '../screen-note/screen-note';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/dash/dash.html',
  providers: [Configure, Encrypt, Dashboard]
})
  
export class DashPage implements OnInit {
  url: any;
  localStorage: any;
  bps: any;
  bpd: any;
  weight: any;
  bmi: any;
  pulse: any;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private dashboard: Dashboard
  ) { 
    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
  }

  goBloodPressure() {
     this.nav.push(BloodPressurePage);
  }

  goBmi() {
     this.nav.push(BmiPage);
  }

  goPulse() {
     this.nav.push(PulsePage);
  }

  openScreenNote() {
    this.nav.push(ScreenNotePage);
  }

  ngOnInit() {
    
  }

  ionViewLoaded() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...')

    let url = `${this.url}/api/dash/screening`;
  
    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        
        this.dashboard.getScreening(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);

            let rows = jsonData;
            
            this.bmi = numeral(rows.bmi).format('0');;
            this.bpd = rows.bpd;
            this.bps = rows.bps;
            this.weight = rows.bw;
            this.pulse = rows.pulse;

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
