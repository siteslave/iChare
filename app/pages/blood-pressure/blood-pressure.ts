import { Component, OnInit } from '@angular/core';
import { NavController, Platform, LoadingController, ToastController, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Dashboard} from '../../providers/dashboard/dashboard';
import {CHART_DIRECTIVES} from 'angular2-highcharts';

import * as _ from 'lodash';
import * as moment from 'moment';

interface ScreenData {
  vstdate?: any,
  vsttime?: any,
  bw?: any,
  height?: any,
  pulse?: any,
  bpd?: any,
  bps?: any,
  bmi?: any
}

@Component({
  templateUrl: 'build/pages/blood-pressure/blood-pressure.html',
  directives: [CHART_DIRECTIVES],
  providers: [Configure, Encrypt, Dashboard]
})
export class BloodPressurePage implements OnInit {
  optionBP: Object;
  url: any;
  localStorage: any;
  bpData: any;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private dashboard: Dashboard,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {

    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    
  }

  ngOnInit() {
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();
    
    let url = `${this.url}/api/dash/history`;
  
    this.localStorage.get('token')
      .then(token => {
        this.bpData = [];
        /**
        {
          name: 'ความดันบน (SBP)',
          data: [120, 100.5, 106.4, 129.2],
        }
         */
        let bps = [];
        let bpd = [];

        this.dashboard.getHistory(url, token)
          .then(data => {
            let decryptText = this.encrypt.decrypt(data);
            let jsonData = JSON.parse(decryptText);
            let rows = <Array<any>>jsonData;
            for (let row of rows) {
              let obj = <ScreenData>row;
              obj.vstdate = `${moment(row.vstdate).format('D/M')}/${moment(row.regdate).get('year') + 543}`;
              obj.vsttime = moment(row.vsttime, 'HH:mm:ss').format('HH:mm');
              obj.bpd = row.bpd;
              obj.bps = row.bps;
              obj.bw = row.bw;
              obj.height = row.height;
              obj.bmi = row.bmi;
              obj.pulse = row.pulse;

              bps.push(parseInt(row.bps));
              bpd.push(parseInt(row.bpd));

              this.bpData.push(obj);
            }

            this.setGraph(bpd, bps);
            
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

  setGraph(bpd, bps) {
    console.log(bpd);
    console.log(bps);

    this.optionBP = {
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      yAxis: {
        title: { text: 'ระดับนำ้ตาล (mg/dL)' },
        plotLines: [{
          value: 120.1,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐานไม่เกิน: 120',
            align: 'center',
            style: {
              color: 'gray'
            }
          }
        },
          {
            value: 90.1,
            color: 'red',
            width: 1,
            label: {
              text: 'ค่ามาตรฐานไม่เกิน: 90',
              align: 'center',
              style: {
                color: 'gray'
              }
            }
          }
        ],
      },
      title: { text: '' },
      series: [
        {
          name: 'ความดันบน (SBP)',
          data: bps,
        },
        {
          name: 'ความดันล่าง (DBP)',
          data: bpd,
          color: 'green'
        }
      ]
    };
  }

}
