import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

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

  constructor(
    private nav: NavController,
    private encrypt: Encrypt,
    private config: Configure,
    private appointment: Appointment,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);

    this.id = this.navParams.get('id');
    console.log(this.id);
  }

  ionViewDidEnter() {
    this.getData();
  }

  getData() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    this.localStorage.get('token')
      .then(token => {
        let url = `${this.url}/api/appointment/detail`;
        let params = this.encrypt.encrypt({ id: this.id });

        this.appointment.getDetail(url, token, params)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <AppointDetail>jsonData;
            this.clinic_name = rows.clinic_name;
            this.nextdate = `${moment(rows.nextdate).format('D/M')}/${moment(rows.nextdate).get('year') + 543}`;
            this.nexttime = moment(rows.nexttime, 'HH:mm:ss').format('HH:mm');
            this.department = rows.department;
            this.contact_point = rows.contact_point;
            this.doctor_name = rows.doctor_name;
            loading.dismiss();
          }, err => {
            loading.dismiss();
            // this.refresher.complete(); 
            let toast = this.toastCtrl.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            toast.present();
          });
      });
  }

}
