import {Component, ViewChild} from "@angular/core";
import {NavController, Storage, LocalStorage, Tabs, Toast} from "ionic-angular";
import {HomePage} from '../home/home';
import {CalendarPage} from '../calendar/calendar';
import {SettingsPage} from '../settings/settings';
import {NewsPage} from '../news/news';
import {DashPage} from '../dash/dash';

import {AboutPage} from '../about/about';

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
  // @ViewChild('tabMain') tabs: Tabs;
  toast;
  localStorage;

  constructor(public nav: NavController) {

    }
 
    openAbout() {
      this.nav.push(AboutPage)
    } 
}
