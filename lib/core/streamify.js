/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Transform, Readable } = require("stream");

streamify = (action) => {
    const stream = Readable({
        objectMode: true,
        read: () => { },
    });
    const type = typeof action == "function" ? "function" : Array.isArray(action) ? "array" : "object" ;
    process.nextTick(async () => {
        try {
            switch(type) {
                case "function": stream.push(await action()); break;
                case "array": {
                    for( let item of action)
                        stream.push(item);
                    break;
                }
                default: stream.push(action); break;
            }
            stream.push(null);
        }
        catch (error) {
            //throw error to piped stream;
            const { pipes } = stream._readableState;
            if (Array.isArray(pipes)) {
                for (var i = 0; i < state.pipesCount; i++)
                    pipes[i].emit("error", error);
            }
            else if (pipes) {
                pipes.emit("error", error);
            }
        }
    })
    return stream;
}

transform = (action) => {
    return new Transform({
        objectMode: true,
        async transform(chunk, encoding, callback) {
            try {
                const res = await action(chunk, encoding);
                callback(null, res);
            }
            catch (error) {
                callback(error);
            }
        }
    });
}

noop = () => {
    return transform((chunk, encoding) => chunk);
}

module.exports.streamify = streamify;
module.exports.transform = transform;
module.exports.transform = noop;