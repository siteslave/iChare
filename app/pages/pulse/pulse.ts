import { Component, OnInit } from '@angular/core';
import { NavController, Platform, Loading, Toast, Storage, LocalStorage } from 'ionic-angular';

import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {Dashboard} from '../../providers/dashboard/dashboard';
import {CHART_DIRECTIVES} from 'angular2-highcharts';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';

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
  templateUrl: 'build/pages/pulse/pulse.html',
  directives: [CHART_DIRECTIVES],
  providers: [Configure, Encrypt, Dashboard]
})
export class PulsePage implements OnInit {
  optionPulse: Object;
  url: any;
  localStorage: any;
  pulseData: any;

  constructor(
    private nav: NavController,
    private config: Configure,
    private encrypt: Encrypt,
    private dashboard: Dashboard
  ) {

    this.url = this.config.getUrl();
    this.localStorage = new Storage(LocalStorage);
    
  }

  ngOnInit() {
    let loading = Loading.create({
      content: 'Please wait...'
    });

    this.nav.present(loading);
    
    let url = `${this.url}/api/dash/history`;
  
    this.localStorage.get('token')
      .then(token => {
        this.pulseData = [];

        let graphData = [];
        let graphCategories = [];

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
              obj.bmi = numeral(row.bmi).format('0');
              obj.pulse = parseInt(row.pulse);

              graphData.push(parseInt(row.pulse));
              graphCategories.push(obj.vstdate);
              this.pulseData.push(obj);
            }

            this.setGraph(graphData, graphCategories);
            
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

    setGraph(data, categories) {
    this.optionPulse = {
    
      chart: {
        type: 'line',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'วันที่รับบริการ'
        }
      },
      yAxis: {
        title: { text: 'Pulse' },
        plotLines: [{
          value: 23.4,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐานไม่ควรเกิน 23.4',
            align: 'center',
            style: {
              color: 'red'
            }
          }
        }],
      },
      title: { text: '' },
      series: [
        {
          name: 'Pulse',
          data: data,
        }
      ]

    };
  }

}
