/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { Readable } = require("stream");
const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kReadableInit = Symbol("readableinit");
const kFilter = Symbol("filter");
const kOptions = Symbol("options");
const kSkip = Symbol("skip");
const kLimit = Symbol("limit");
const kSort = Symbol("sort");
const kProject = Symbol("project");

class Find extends Readable {
    constructor(crud, filter, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
        this[kReadableInit] = false;
        this[kFilter] = filter;
        this[kOptions] = options;
        this[kSkip] = null;
        this[kLimit] = null;
        this[kSort] = null;
        this[kProject] = null;

        this.once("readableinit", async () => this.onceReadableInit());
    };

    skip(skip) {
        this[kSkip] = skip;
        return this;
    }

    limit(limit) {
        this[kLimit] = limit;
        return this;
    }

    sort(sort) {
        this[kSort] = sort;
        return this;
    }

    project(project) {
        this[kProject] = project;
        return this;
    }

    async onceReadableInit() {
        this[kReadable] = await this[kCrud].mongoFind(this[kFilter], this[kOptions]);
        if (this[kSkip]) this[kReadable] = this[kReadable].skip(this[kSkip]);
        if (this[kLimit]) this[kReadable] = this[kReadable].limit(this[kLimit]);
        if (this[kSort]) this[kReadable] = this[kReadable].sort(this[kSort]);
        if (this[kProject]) this[kReadable] = this[kReadable].project(this[kProject]);

        this[kReadable].on("data", data => {
            this.push(data);
        });
        this[kReadable].on("end", () => {
            this.push(null);
            const { awaitDrain } = this._readableState;
            if (awaitDrain) 
                this.resume();
        });
        this[kReadable].on("error", error => {
            this.emit("error", error);
        });

        this[kReadableInit] = true;
        this.resume();
    }

    _read(size) {
        if (!this[kReadableInit]) {
            this.pause();
            process.nextTick(() => this.emit("readableinit"));
        }
    }
};

exports = module.exports = Find;