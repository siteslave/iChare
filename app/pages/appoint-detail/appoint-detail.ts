import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import {SpinnerDialog, SecureStorage, Toast} from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Appointment} from '../../providers/appointment/appointment';

import * as _ from 'lodash';
import * as moment from 'moment';

interface AppointDetail {
  clinic_name?: any,
  contact_point?: any,
  department?: any,
  nextdate?: any,
  nexttime?: any,
  doctor_name?: any
}

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/appoint-detail/appoint-detail.html',
  providers: [Configure, Encrypt, Appointment]
})
export class AppointDetailPage {
  url: any;
  localStorage: any;
  id: any;

  clinic_name: any;
  contact_point: any;
  department: any;
  nextdate: any;
  nexttime: any;
  doctor_name: any;
  sessionData: any;
   secureStorage: SecureStorage;

  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private appointment: Appointment,
    private navParams: NavParams
  ) {
    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });

    this.id = this.navParams.get('id');
    // console.log(this.id);
  }

  ionViewDidEnter() {
    this.getData();
  }

  getData() {
    SpinnerDialog.show('', 'กรุณารอซักครู่...')

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, id: this.id };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        let url = `${this.url}/api/appointment/detail`;

        this.appointment.getDetail(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = <AppointDetail>jsonData;

            this.clinic_name = rows.clinic_name;
            this.nextdate = `${moment(rows.nextdate).format('D/M')}/${moment(rows.nextdate).get('year') + 543}`;
            this.nexttime = moment(rows.nexttime, 'HH:mm:ss').format('HH:mm');
            this.department = rows.department;
            this.contact_point = rows.contact_point;
            this.doctor_name = rows.doctor_name;
            SpinnerDialog.hide();
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            // this.refresher.complete(); 
            Toast.show('เกิดข้อผิดพลาด', '3000', 'center').subscribe(() => { });
          });
      });
  }

}
