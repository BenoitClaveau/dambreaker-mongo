/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { PassThrough } = require("stream");
const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kPipeline = Symbol("pipeline");
const kOptions = Symbol("options");

class Aggregate extends PassThrough {
    constructor(crud, pipeline, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
        this[kPipeline] = pipeline;
        this[kOptions] = options;

        this.once("readableinit", async () => this.onceReadableInit());
    };

    async onceReadableInit() {
        this[kReadable] = await this[kCrud].mongoAggregate(this[kPipeline], this[kOptions]);
        
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
        
        this.resume(); // resume then flow(stream) then stream.read
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

exports = module.exports = Aggregate;