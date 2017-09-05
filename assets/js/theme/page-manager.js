import async from 'async';

export default class PageManager {
    constructor(context) {
        // console.log('PageManager constructor');
        this.context = context;
    }

    before(next) {
        // console.log('PageManager before');
        next();
    }

    loaded(next) {
        // console.log('PageManager loaded');
        next();
    }

    after(next) {
        // console.log('PageManager after');
        next();
    }

    type() {
        return this.constructor.name;
    }

    load() {
        // console.log('PageManager load');
        async.series([
            this.before.bind(this), // Executed first after constructor()
            this.loaded.bind(this), // Main module logic
            this.after.bind(this), // Clean up method that can be overridden for cleanup.
        ], (err) => {
            if (err) {
                throw new Error(err);
            }
        });
    }
}
