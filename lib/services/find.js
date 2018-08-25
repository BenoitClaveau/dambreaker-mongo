/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { PassThrough } = require("stream");
const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kFilter = Symbol("filter");
const kOptions = Symbol("options");
const kSkip = Symbol("skip");
const kLimit = Symbol("limit");
const kSort = Symbol("sort");
const kProject = Symbol("project");

class Find extends PassThrough {
    constructor(crud, filter, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
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

        //cf damless/lib/services/asp-reply.js

        this[kReadable].on("data", data => {
            this.push(data);
            //super.read(this._readableState.highWaterMark); //Not needed because push call flow
        });

        this[kReadable].on("end", () => {
            this.push(null);
            super.read(0);    //We must call read(0) to emit stream."end" event
                              //Bug: in some case dest.end is not a function
                              //onend: is defined: stream.Readeable, stream.Duplex, stream.Transform
                              //cf this._events["end"] -> listeners
        });
        
        this[kReadable].on("error", error => { //emit error beacuse we are reading.
            this.emit("error", error);
        });

        this.resume();  // resume then flow(stream) then stream.read
    }

    read(size) {
        if (!this[kReadable]) {
            this.pause();
            this.emit("readableinit");
            return false;
        }
        
        return this[kReadable].read(size); //force readable to read
    }
};

exports = module.exports = Find;