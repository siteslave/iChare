import { Component, OnInit } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import {SecureStorage, SpinnerDialog, Toast} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Opd} from '../../providers/opd/opd';

import * as _ from 'lodash';
import * as moment from 'moment';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/out-patient-detail/out-patient-detail.html',
  providers: [Encrypt, Configure, Opd]
})
  
export class OutPatientDetailPage implements OnInit {

  menu: string = "Screening";
  isAndroid: boolean = false;
  url: any;
  vstdate: any;
  vsttime: any;
  cc: any;
  bw: any;
  bmi: any;
  waist: any;
  height: any;
  bps: any;
  bpd: any;
  vn: any;
  department: any;

  pttype_name: any;

  diags: any;
  drugs: any;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private opd: Opd,
    private navParams: NavParams
  ) { 
    this.url = this.config.getUrl();
    this.isAndroid = platform.is('android');
    this.vn = this.navParams.get('vn');

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare').then(() => { });

  };

  ngOnInit() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...');
    
    let url = `${this.url}/api/opd/detail`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, vn: this.vn };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
             
        this.opd.getDetail(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = jsonData;

            let screening = rows.screening;
            this.diags = rows.diag;
            this.drugs = rows.drug;

            this.vstdate = `${moment(screening.vstdate).format('D/M')}/${moment(screening.vstdate).get('year') + 543}`;
            this.vsttime = moment(screening.vsttime, 'HH:mm:ss').format('HH:mm');
            this.vn = screening.vn;
            this.cc = screening.cc;
            this.bw = screening.bw;
            this.height = screening.height;
            this.bmi = screening.bmi;
            this.waist = screening.waist;
            this.bps = screening.bps;
            this.bpd = screening.bpd;
            this.pttype_name = screening.pttype_name;
            this.department = screening.department;
           
            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย', '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            Toast.show('เกิดข้อผิดพลาด : ' + JSON.stringify(err), '3000', 'center')
              .subscribe(toast => { });
          });
      });
        
  }
  
}
