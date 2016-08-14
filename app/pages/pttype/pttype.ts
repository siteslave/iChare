import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {SpinnerDialog, Toast, SecureStorage} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

import {Pttype} from '../../providers/pttype/pttype';
import {OutPatientDetailPage} from '../out-patient-detail/out-patient-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface PttypeResult {
  current: any,
  history: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

interface PttypeHistory {
  vstdate?: any,
  vsttime?: any,
  pttype_name?: any,
  vn?: any
}

interface PttypeCurrent {
  pttype_name?: any,
  pttypeno?: any,
  hmain?: any,
  hsub?: any,
  expiredate?: any,
  begindate?: any
}

@Component({
  templateUrl: 'build/pages/pttype/pttype.html',
  providers: [Encrypt, Configure, Pttype]
})

export class PttypePage implements OnInit {
  url;
  currentPttypeName;
  currentPttypeNo;
  currentBeginDate;
  currentExpireDate;
  currentHmain;
  currentHsub;
  historyPttype;
  hasData: boolean = false;
  isAndroid: boolean = false;

  secureStorage: SecureStorage;
  sessionData;
  
  
  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private pttype: Pttype,
    private platform: Platform
  ) {
    this.url = this.config.getUrl();
    this.isAndroid = this.platform.is('android');
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
  }


  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...')    
  
    let url = `${this.url}/api/pttype/get-pttype`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        this.historyPttype = [];

        this.pttype.getPttype(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = <PttypeResult>JSON.parse(decryptText);

            let rowsHistories = <Array<any>>jsonData.history;
            let current = <PttypeCurrent>jsonData.current;
        
            this.currentBeginDate = `${moment(current.begindate).format('DD/MM')}/${moment(current.begindate).get('year') + 543}`;
            this.currentExpireDate = `${moment(current.expiredate).format('DD/MM')}/${moment(current.expiredate).get('year') + 543}`;
            this.currentPttypeNo = current.pttypeno;
            this.currentPttypeName = current.pttype_name;
            this.currentHmain = current.hmain;
            this.currentHsub = current.hsub;


            for (let row of rowsHistories) {
              let history = <PttypeHistory>row;
              history.pttype_name = row.pttype_name;
              history.vstdate = `${moment(row.vstdate).format('DD/MM')}/${moment(row.vstdate).get('year') + 543}`;
              history.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              history.vn = row.vn;

              this.historyPttype.push(history);
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

  goDetail(vn) {
    this.nav.push(OutPatientDetailPage, { vn: vn });
  }
  
}
