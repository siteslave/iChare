import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Configure} from '../../providers/configure/configure';
import {Ipd} from '../../providers/ipd/ipd';

import * as moment from 'moment';
import * as _ from 'lodash';

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

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private platform: Platform,
    private config: Configure,
    private encrypt: Encrypt,
    private ipd: Ipd,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();
    this.an = this.navParams.get('an');
    this.isAndroid = this.platform.is('android');
    console.log(this.an);
  }

  ngOnInit() {

    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    this.localStorage.get('token')
      .then(token => {
      
        let _url = `${this.url}/api/ipd/detail`;

        let params = this.encrypt.encrypt({ an: this.an });
        this.ipd.getDetail(_url, token, params)
          .then(result => {
            let decryptText = this.encrypt.decrypt(result);
            let jsonData = JSON.parse(decryptText);

            // console.log(jsonData);
            let register = jsonData.register;
            this.drugs = jsonData.drugHome;
            console.log(jsonData);
            console.log(this.drugs);
            // console.log(jsonData);

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

            loading.dismiss();
          }, err => {
            loading.dismiss();
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
