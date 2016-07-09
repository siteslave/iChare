import {Component, ViewChild} from "@angular/core";
import {NavController, Storage, LocalStorage, Tabs, Toast} from "ionic-angular";
import {HomePage} from '../home/home';
import {CalendarPage} from '../calendar/calendar';
import {SettingsPage} from '../settings/settings';
import {NewsPage} from '../news/news';
import {DashPage} from '../dash/dash';

// import * as cryptojs from 'crypto-js';

@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tabHome: any = HomePage;
  tabCalendar: any = CalendarPage;
  tabSettings: any = SettingsPage;
  tabNews: any = NewsPage;
  tabDash: any = DashPage;
  @ViewChild('tabMain') tabs: Tabs;
  toast;
  localStorage;

  constructor(public nav: NavController) {

    this.localStorage = new Storage(LocalStorage);
    
    try {
      this.localStorage.get('patient')
        .then(patient => {
          let _patient = JSON.parse(patient);
          if (!_patient) {
            let toast = Toast.create({
              message: 'กรุณากำหนดค่าเริ่มต้นสำหรับผู้ป่วย',
              duration: 3000,
              position: 'top'
            });
            // this.tabs.select(3);
            this.nav.present(toast);
           
          } else {
          
          }
        });
    } catch (err) {
      console.log('Error: ' + JSON.stringify(err));
    }

  }

  // ngAfterViewInit() {
  //   this.tabs.select(3);
  // }  
}
