import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SecureStorage, Toast, SpinnerDialog } from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Ipd} from '../../providers/ipd/ipd';
import {IpdDetailPage} from '../ipd-detail/ipd-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface rowResults {
  an?: any,
  dchdate?: any,
  dchtime?: any,
  prediag?: any,
  regdate?: any,
  regtime?: any,
  ward_name?: any,
  pttype_name?: any,
  diag_name?: any,
  dchstts_name?: any,
  dchtype_name?: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/ipd/ipd.html',
  providers: [Encrypt, Configure, Ipd]
})
export class IpdPage implements OnInit {

  url;
  secureStorage: SecureStorage;
  admissions;
  isAndroid: boolean = false;
  sessionData;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private ipd: Ipd,
    private platform: Platform
  ) {
    this.url = this.config.getUrl();
    this.isAndroid = this.platform.is('android');

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
    
  }


  goIpdDetail(an) {
    this.nav.push(IpdDetailPage, {an: an});
  }  

  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...')
  
    let url = `${this.url}/api/ipd/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        

        this.admissions = [];
        this.ipd.getAdmid(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);

            let rows = jsonData;

            for (let row of rows) {
              let ipdData = <rowResults>row;
              ipdData.regdate = `${moment(row.regdate).format('DD/MM')}/${moment(row.regdate).get('year') + 543}`;
              ipdData.regtime = moment(row.regtime, 'HH:mm:ss').format('HH:mm');
              ipdData.ward_name = row.ward_name;
              ipdData.prediag = row.prediag;
              ipdData.an = row.an;

              this.admissions.push(ipdData);
            }
            
            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย' , '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            Toast.show('เกิดข้อผิดพลาด: ' + JSON.stringify(err) , '3000', 'center')
              .subscribe(toast => { });
          });
      });
        
  }

}
