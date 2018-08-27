/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */
const { Readable } = require("stream");
const kCrud = Symbol("crud");
const kReadable = Symbol("cursor");
const kReadableInit = Symbol("readableinit");
const kPipeline = Symbol("pipeline");
const kOptions = Symbol("options");

class Aggregate extends Readable {
    constructor(crud, pipeline, options = {}) {
        super({ objectMode: true });

        this[kCrud] = crud;
        this[kReadable] = null;
        this[kReadableInit] = false;
        this[kPipeline] = pipeline;
        this[kOptions] = options;

        this.once("readableinit", async () => this.onceReadableInit());
    };

    async onceReadableInit() {
        this[kReadable] = await this[kCrud].mongoAggregate(this[kPipeline], this[kOptions]);

        this[kReadable].on("data", data => {
            this.push(data);
        });
        this[kReadable].on("end", () => {
            this.push(null);
        });
        this[kReadable].on("error", error => {
            this.emit("error", error);
        });

        this[kReadableInit] = true;
        this.resume(); // resume then flow(stream) then stream.read
    }

    _read(size) {
        if (!this[kReadableInit]) {
            this.pause();
            process.nextTick(() => this.emit("readableinit"));
            return null;
        }
    }
};

exports = module.exports = Aggregate;