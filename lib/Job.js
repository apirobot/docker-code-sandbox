"use strict";

let _ = require('lodash')

class Job {
    constructor(code, language, stdin, timeoutMs, cb) {
        this.code = code
        this.language = language
        this.stdin = stdin
        this.cb = cb || _.noop
        this.timeoutMs = timeoutMs
    }
}

module.exports = Job
