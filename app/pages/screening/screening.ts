import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {SpinnerDialog, Toast, SecureStorage} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Screening} from '../../providers/screening/screening';
import * as _ from 'lodash';
import * as moment from 'moment';

interface httpData {
  foot: any,
  eye: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}


interface footResult {
  screen_date?: any,
  screen_time?: any,
  foot_left_result?: any,
  foot_right_result?: any,
  has_foot_cormobidity?: any
} 

interface eyeResult {
  screen_date?: any,
  screen_time?: any,
  eye_left_result?: any,
  eye_right_result?: any,
  has_eye_cormobidity?: any
}

@Component({
  templateUrl: 'build/pages/screening/screening.html',
  providers: [Encrypt, Configure, Screening]
})
export class ScreeningPage implements OnInit {

  isAndroid: boolean = false;
  url;
  localStorage;
  footScreenDate;
  footScreenTime;
  footRightResult;
  footLeftResult;

  eyeScreenDate;
  eyeScreenTime;
  eyeRightResult;
  eyeLeftResult;

  hasData: boolean = false;

  secureStorage: SecureStorage;
  sessionData;
  
  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private screening: Screening
  ) {
    this.isAndroid = this.platform.is('android');
    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
  }

  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...')
    
    let url = `${this.url}/api/screening/history`;
  
      this.secureStorage.get('data')
        .then(sessionData => {
          let _sessionData = JSON.parse(sessionData);
          this.sessionData = <SessionData>_sessionData;
          let _params = { token: this.sessionData.token };
          let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
          
          this.screening.getHistory(url, this.sessionData.memberId, _encryptedParams)
            .then(data => {
              let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
              let _decryptedText = <string>decryptedText;
              let jsonData = JSON.parse(_decryptedText);

              let rows = <httpData>jsonData;
              let footHistory = <footResult>rows.foot;
              let eyeHistory = <eyeResult>rows.eye;

              if (footHistory) {
                this.footScreenDate = `${moment(footHistory.screen_date).format('D/M')}/${moment(footHistory.screen_date).get('year') + 543}`;
                this.footScreenTime = moment(footHistory.screen_time, 'HH:mm:ss').format('HH:mm');
                this.footLeftResult = footHistory.foot_left_result;
                this.footRightResult = footHistory.foot_right_result;
              }
              // console.log(rows);  
              if (eyeHistory) {
                this.eyeScreenDate = `${moment(eyeHistory.screen_date).format('D/M')}/${moment(eyeHistory.screen_date).get('year') + 543}`;
                this.eyeScreenTime = moment(eyeHistory.screen_time, 'HH:mm:ss').format('HH:mm');
                this.eyeLeftResult = eyeHistory.eye_left_result;
                this.eyeRightResult = eyeHistory.eye_right_result;
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
