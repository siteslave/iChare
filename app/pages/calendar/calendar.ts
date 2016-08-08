import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Appointment} from '../../providers/appointment/appointment';

import {AppointDetailPage} from '../appoint-detail/appoint-detail';
import {AppointServiceDetailPage} from '../appoint-service-detail/appoint-service-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface AppointData {
  nextdate?: any,
  nexttime?: any,
  department?: any,
  clinic_name?: any,
  oapp_id?: any
}

interface ServiceData {
  bpd?: any,
  bps?: any,
  cc?: any,
  vstdate?: any,
  vsttime?: any,
  vn?: any,
  ptname?: any,
}

@Component({
  templateUrl: 'build/pages/calendar/calendar.html',
  providers: [Encrypt, Configure, Appointment]
})
export class CalendarPage {
  url: any;
  localStorage: any;
  appointments: any;
  services: any;
  isAndroid: boolean = false;

  constructor(
    public nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private appointment: Appointment,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    this.isAndroid = this.platform.is('android');
   }
  
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  
  }

  ionViewDidEnter() {
    this.getData();
    // this.getLastVisit();
  }

  goAppointDetail(id) {
    this.nav.push(AppointDetailPage, { id: id });
  };

  goAppointServiceDetail(vn) {
    this.nav.push(AppointServiceDetailPage, { vn: vn });
  };
  
  getData() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.appointments = [];
    loading.present();

    this.localStorage.get('token')
      .then(token => {
        let url = `${this.url}/api/appointment/list`;
        this.appointment.getList(url, token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            // console.log(rows);
            
            for (let row of rows) {
              let appoint = <AppointData>row;
              
              appoint.nextdate = `${moment(row.nextdate).format('D/M')}/${moment(row.nextdate).get('year') + 543}`;
              appoint.nexttime = moment(row.nexttime, 'HH:mm:ss').format('HH:mm');
              appoint.department = row.department;
              appoint.clinic_name = row.clinic_name;
              appoint.oapp_id = row.oapp_id;

              this.appointments.push(appoint);
            }

            let _url = `${this.url}/api/appointment/lastvisit`;            
            return this.appointment.getLastVisit(_url, token);
            // this.refresher.complete();            
            // loading.dismiss();
          })
          .then(dataService => {
            let decryptText = this.encrypt.decrypt(dataService);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            this.services = [];
            
           for (let row of rows) {
              let service = <ServiceData>row;
              
              service.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.vstdate).get('year') + 543}`;
              service.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              service.cc = row.cc;
              service.bps = row.bps;
              service.bpd = row.bpd;
              service.ptname = row.ptname;
              service.vn = row.vn;

              this.services.push(service);
            }

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
