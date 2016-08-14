import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SpinnerDialog } from 'ionic-native';
import { TabsPage } from '../tabs/tabs';

/*
  Generated class for the WelcomePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/welcome/welcome.html',
})
export class WelcomePage {

  constructor(private navCtrl: NavController) {

  }


  goHome() {
    SpinnerDialog.show('Loading', 'Please wait..');
    setTimeout(function () {
      SpinnerDialog.hide();
    }, 1000);
    this.navCtrl.setRoot(TabsPage);
  }

}
