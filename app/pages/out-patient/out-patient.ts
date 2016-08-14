import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {SpinnerDialog, Toast, SecureStorage} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Opd} from '../../providers/opd/opd';

import * as _ from 'lodash';
import * as moment from 'moment';

import {OutPatientDetailPage} from '../out-patient-detail/out-patient-detail';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

interface ServiceResult {
  vstdate?: any,
  vsttime?: any,
  cc?: any,
  department?: any,
  vn?: any
}

@Component({
  templateUrl: 'build/pages/out-patient/out-patient.html',
  providers: [Encrypt, Configure, Opd]
})
export class OutPatientPage implements OnInit {
  isAndroid: boolean = false;
  url: any
  services: any;
  refresher: any;
  secureStorage: SecureStorage;
  sessionData;

  constructor(
    private nav: NavController,
    private platform: Platform,
    private encrypt: Encrypt,
    private config: Configure,
    private opd: Opd
  ) {
    this.url = this.config.getUrl();
    this.isAndroid = platform.is('android');

    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare').then(() => { });
    
  }

  gotoDetail(vn) {
    this.nav.push(OutPatientDetailPage, {vn: vn})
  }

  doRefresh(refresher) {

    let url = `${this.url}/api/opd/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        
        this.services = [];

        this.opd.getHistory(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = <Array<any>>jsonData;

            for (let row of rows) {
              let service = <ServiceResult>row;
              
              service.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.vstdate).get('year') + 543}`;
              service.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              service.department = row.department;
              service.vn = row.vn;

              this.services.push(service);
            }

            refresher.complete();
            Toast.show('เสร็จเรียบร้อย', '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            refresher.complete();
            this.refresher.complete();
            Toast.show('เกิดข้อผิดพลาด: ' + JSON.stringify(err) , '3000', 'center')
              .subscribe(toast => { });
          });
      });

  }

  ngOnInit() {

  }

  ionViewDidEnter() {
    this.getData();
  }

  getData() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...');
    
    let url = `${this.url}/api/opd/history`;
  
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        this.services = [];

        this.opd.getHistory(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = <Array<any>>jsonData;

            for (let row of rows) {
              let service = <ServiceResult>row;
              
              service.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.vstdate).get('year') + 543}`;
              service.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              service.department = row.department;
              service.vn = row.vn;

              this.services.push(service);
            }

            SpinnerDialog.hide();
            Toast.show('เสร็จเรียบร้อย' , '3000', 'center')
              .subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            this.refresher.complete(); 
            Toast.show('เกิดข้อผิดพลาด: ' + JSON.stringify(err) , '3000', 'center')
              .subscribe(toast => { });
          });
      });
  }
  
}
