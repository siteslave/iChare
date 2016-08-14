import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { SecureStorage, Toast, SpinnerDialog } from 'ionic-native';

import {Encrypt} from '../../providers/encrypt/encrypt';
import {Configure} from '../../providers/configure/configure';
import {Ipd} from '../../providers/ipd/ipd';

import * as moment from 'moment';
import * as _ from 'lodash';


interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

interface IpdResult {
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

interface drugResult {
  drug_name?: any,
  qty?: number,
  units?: any,
  name1?: any,
  name2?: any,
  name3?: any,
}

@Component({
  templateUrl: 'build/pages/ipd-detail/ipd-detail.html',
  providers: [Encrypt, Configure, Ipd]
})
export class IpdDetailPage implements OnInit {
  an: any;
  drugs;
  menu: string = "Admission";
  isAndroid: boolean = false;
  url: any;
  localStorage: any;
  dchdate: any;
  dchtime: any;
  prediag: any;
  regdate: any;
  regtime: any;
  ward_name: any;
  pttype_name: any;
  diag_name: any;
  dchstts_name: any;
  dchtype_name: any;

  sessionData;
  secureStorage: SecureStorage;

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private ipd: Ipd
  ) {

    this.url = this.config.getUrl();
    this.an = this.navParams.get('an');
    this.isAndroid = this.platform.is('android');
   
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });
   
  }

  ngOnInit() {

    SpinnerDialog.show('', 'กรุณารอซักครุ่...')
    
    this.secureStorage.get('data')
      .then(sessionData => {
      
        let _url = `${this.url}/api/ipd/detail`;

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, an: this.an };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
   
        this.ipd.getDetail(_url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);

            let register = jsonData.register;
            this.drugs = jsonData.drugHome;

            let rowsInfo = <IpdResult>register;
            this.dchdate = rowsInfo.dchdate ? `${moment(rowsInfo.dchdate).format('DD/MM')}/${moment(rowsInfo.dchdate).get('year') + 543}` : '-';
            this.dchtime = rowsInfo.dchtime ? moment(rowsInfo.dchtime, 'HH:mm:ss').format('HH:mm') : '-';
            this.regdate = `${moment(rowsInfo.regdate).format('DD/MM')}/${moment(rowsInfo.regdate).get('year') + 543}`;
            this.regtime = moment(rowsInfo.regtime, 'HH:mm:ss').format('HH:mm');

            this.ward_name = rowsInfo.ward_name;
            this.prediag = rowsInfo.prediag;
            this.dchstts_name = rowsInfo.dchstts_name;
            this.dchtype_name = rowsInfo.dchtype_name;

            this.diag_name = rowsInfo.diag_name;
            this.pttype_name = rowsInfo.pttype_name;

            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย' , '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            Toast.show('เกิดข้อผิดพลาด: ' + JSON.stringify(err) , '3000', 'center')
              .subscribe(toast => { });
          });

      });
  }

}
