import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {CHART_DIRECTIVES} from 'angular2-highcharts';

/*
  Generated class for the BloodPressurePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/blood-pressure/blood-pressure.html',
  directives: [CHART_DIRECTIVES],
})
export class BloodPressurePage {
  optionFBS: Object;
  optionBP: Object;
  
  constructor(public nav: NavController) {
    this.optionFBS = {
      chart: {
        type: 'area',
      },
      credits: {
        enabled: false
      },
      xAxis: {
        allowDecimals: false,
        labels: {
          formatter: function () {
            return this.value; // clean, unformatted number for year
          }
        }
      },
      yAxis: {
        title: {
          text: 'Nuclear weapon states'
        },
        labels: {
          formatter: function () {
            return this.value / 1000 + 'k';
          }
        }
      },
      tooltip: {
        pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
      },
      
      plotOptions: {
        area: {
          pointStart: 1940,
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 2,
            states: {
              hover: {
                enabled: true
              }
            }
          }
        }
      },
      series: [{
        name: 'USA',
        data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
          1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
          27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
          26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
          24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
          22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
          10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
      }]
    };

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
          value: 101,
          color: 'red',
          width: 1,
          label: {
            text: 'ค่ามาตรฐานไม่เกิน: 100',
            align: 'center',
            style: {
              color: 'gray'
            }
          }
        },
          {
          value: 90,
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
          data: [120, 100.5, 106.4, 129.2],
        },
        {
          name: 'ความดันล่าง (DBP)',
          data: [90, 85.5, 98.4, 80.2],
          color: 'green'
        }
      ]
    };
  }
}
