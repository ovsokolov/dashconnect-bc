/* eslint-disable no-useless-constructor */
import PageManager from './page-manager';
// import urlUtils from './common/url-utils';

export default class Home extends PageManager {


    constructor() {
        super();
		// console.log('home constructor');
    }

    loadFinder() {
		// console.log('loadFinder');
    }

    before(next) {
        // console.log('home before');
        next();
    }

    loaded(next) {
        // console.log('home loaded');
        next();
    }

    after(next) {
        // console.log('home after');
        next();
    }
}

