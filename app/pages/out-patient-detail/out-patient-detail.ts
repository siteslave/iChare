import { Component, OnInit } from '@angular/core';
import { NavController, Platform, NavParams, Loading, Toast, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Opd} from '../../providers/opd/opd';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  templateUrl: 'build/pages/out-patient-detail/out-patient-detail.html',
  providers: [Encrypt, Configure, Opd]
})
  
export class OutPatientDetailPage implements OnInit {

  menu: string = "Screening";
  isAndroid: boolean = false;
  url: any;
  localStorage: any;
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

  constructor(
    private nav: NavController,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private opd: Opd,
    private navParams: NavParams
  ) { 
    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    this.isAndroid = platform.is('android');

    this.vn = this.navParams.get('vn');
  };

  ngOnInit() {
    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);
    
    let secretKey = this.config.getSecretKey();
    let url = `${this.url}/api/opd/detail`;
  
    this.localStorage.get('token')
      .then(token => {
        let params = this.encrypt.encrypt({ vn: this.vn });        
        this.opd.getDetail(url, token, params)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = jsonData;

            console.log(rows);
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
           

            loading.dismiss();
          }, err => {
            loading.dismiss();
            let toast = Toast.create({
              message: 'เกิดข้อผิดพลาด ' + JSON.stringify(err),
              duration: 3000,
              position: 'top'
            });

            this.nav.present(toast);
          });
      });
        
  }
  
}
