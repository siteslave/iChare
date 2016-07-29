import {Component, enableProdMode} from "@angular/core";
import {Platform, ionicBootstrap, MenuController, Events} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {LoginPage} from './pages/login/login';
import {AboutPage} from './pages/about/about';

enableProdMode();

@Component({
  templateUrl: 'build/app.html',
  // providers: []
})
export class MyApp {
  //rootPage: any = TabsPage;
  rootPage: any = LoginPage;

  public menu;
  
  constructor(platform: Platform, public events: Events, menu: MenuController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.overlaysWebView(true);
      StatusBar.backgroundColorByHexString('#01508C');
      //StatusBar.styleBlackOpaque();
      // StatusBar.styleDefault();
    });
    this.menu = menu;
    
  }

  openPage() {
    // Reset the nav controller to have just this page
    // we wouldn't want the back button to show in this scenario
    this.rootPage = AboutPage;

    // close the menu when clicking a link from the menu
    this.menu.close();
  }
  

  menuOpened() {
    console.log('Menu open');
  }
  
}

ionicBootstrap(MyApp, [], {
  menuType: 'push',
    platforms: {
      ios: {
        menuType: 'overlay',
      }
  }
});