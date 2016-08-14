import { Component, OnInit } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';
import {Calendar, SecureStorage, Toast, SpinnerDialog, Dialogs } from 'ionic-native';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Appointment} from '../../providers/appointment/appointment';

import {AppointDetailPage} from '../appoint-detail/appoint-detail';
import {AppointServiceDetailPage} from '../appoint-service-detail/appoint-service-detail';

import * as _ from 'lodash';
import * as moment from 'moment';

interface AppointData {
  nextdate?: any,
  trueNextDate?: any,
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
  startDate: Date;
  calendarOption: Object;
  secureStorage: SecureStorage;

  constructor(
    public nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private appointment: Appointment,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    this.isAndroid = this.platform.is('android');

    this.startDate = new Date();

    this.calendarOption = {
      calendarName: 'iChare',
      firstReminderMinutes: 24*60 // 1 day
    };

    this.secureStorage = new SecureStorage();

    this.secureStorage.create('iChare')
      .then(
      () => console.log('Storage is ready!'),
      error => console.log(error)
      );
  

   }
  
  ionViewDidEnter() {
    this.getData();
    // this.getLastVisit();
  }

  openCalendar() {
    Calendar.openCalendar(this.startDate);
  }  

  saveCalendar() {
    
    Dialogs.confirm('คุณต้องการนำเข้านัดหมาย ใช่หรือไม่?', 'ยืนยัน', ['ใช่', 'ยกเลิก'])
      .then(btnIndex => {
        if (btnIndex == 1) {
          this.appointments.forEach(v => {
            // console.log(v);
            let startDate = moment(v.trueNextDate).format('YYYY-MM-DD');
            let startTime = moment(v.nexttime, 'HH:mm').format('HH:mm:ss');
            let trueDate = startDate + ' ' + startTime;
            // console.log(trueDate);

            let _startDate = new Date(moment(trueDate).format());
            // console.log(_startDate);

            Calendar.deleteEvent('นัดหมายโรงพยาบาล', v.department, 'คลินิก: ' + v.clinic_name, _startDate, _startDate)
              .then(result => {
                return Calendar.createEventWithOptions('นัดหมายโรงพยาบาล', v.department, 'คลินิก: ' + v.clinic_name, _startDate, _startDate, this.calendarOption);
              })
              .then(result => {
                Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(toast => { });
              });
            
          });
        }
      });
    
  }

  goAppointDetail(id) {
    this.nav.push(AppointDetailPage, { id: id });
  };

  goAppointServiceDetail(vn) {
    this.nav.push(AppointServiceDetailPage, { vn: vn });
  };
  
  getData() {
    // let loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });

    this.appointments = [];
    // loading.present();
    SpinnerDialog.show('กำลังประมวลผล', 'กรุณารอซักครู่...');

    let url = `${this.url}/api/appointment/list`;

    this.secureStorage.get('token')
      .then(token => {
        this.appointment.getList(url, token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            // console.log(rows);
            
            for (let row of rows) {
              let appoint = <AppointData>row;
              console.log(row);
              appoint.trueNextDate = row.nextdate;
              appoint.nextdate = `${moment(row.nextdate).format('D/M')}/${moment(row.nextdate).get('year') + 543}`;
              appoint.nexttime = moment(row.nexttime, 'HH:mm:ss').format('HH:mm');
              appoint.department = row.department;
              appoint.clinic_name = row.clinic_name;
              appoint.oapp_id = row.oapp_id;
              this.appointments.push(appoint);
            }

            let _url = `${this.url}/api/appointment/lastvisit`;
            return this.appointment.getLastVisit(_url, token);
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

            SpinnerDialog.hide();    
            Toast.show("เสร็จเรียบร้อย", '3000', 'center').subscribe(toast => { });
            // loading.dismiss();
          }, err => {
            SpinnerDialog.hide();
            // loading.dismiss();
            // this.refresher.complete(); 
            console.log(err);
            Toast.show("เกิดข้อผิดพลาด", '3000', 'center').subscribe(toast => { });
          });
      });

  }
  
}
