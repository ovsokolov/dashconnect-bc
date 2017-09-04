/* eslint-disable no-useless-constructor */
import PageManager from './page-manager';

export default class Page extends PageManager {
    constructor(context) {
        super(context);
        // console.log('page constructor')
        // const f = document.getElementById('vehicle-make');
        // console.log(this.context.carMake)
        // console.log('menu length');
        // console.log(f.length);
    }
}
