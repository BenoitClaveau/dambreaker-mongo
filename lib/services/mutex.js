const semaphore = require("semaphore");

class Mutex {
    constructor(capacity = 1) {
        this.sem = semaphore(capacity);
    }

    lock(callback) {
        return new Promise((resolve, reject) => {
            this.sem.take(async () => {
                try {
                    const res = await callback();
                    resolve(res);
                } catch(error) {
                    reject(error);
                } finally {
                    this.sem.leave();
                }
            });
        });
    }

}

exports = module.exports = Mutex;