/*!
 * damless-mongo
 * Copyright(c) 2018 Benoît Claveau <benoit.claveau@gmail.com> / CABASI
 * MIT Licensed
 */

const { Transform, Readable } = require("stream");

streamifyOne = (action) => {
    const stream = Readable({
        objectMode: true,
        read: () => { },
    });
    process.nextTick(async () => {
        try {
            const res = await action();
            stream.push(res);
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

streamify = (action) => {
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

module.exports.streamifyOne = streamifyOne;
module.exports.streamify = streamify;