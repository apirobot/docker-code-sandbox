"use strict";

let _       = require('lodash')
let async   = require('async')
let request = require('request')
let fs      = require('fs-extra')
let log     = require('winston')

/*
 * A class representing a Docker container.
 *
 * The "instance" field corresponds to a Dockerode container instance
 */
class Container {
  constructor(id, instance) {
    this.id = id
    this.instance = instance
    this.ip = ""
    this.cleanedUp = false
  }

  /*
   * Executes a job inside the container
   */
  executeJob(job, cb) {
    const options = {
      url: "http://" + this.ip + ":3000/",
      json: true,
      body: {
        code: job.code,
        language: job.language,
        stdin: job.stdin,
        timeoutMs: job.timeoutMs
      },
      timeout: job.timeoutMs + 500
    };

    request.post(options, (err, res) => {
      if (err) {
        if (err.code === "ETIMEDOUT") {
          return cb(null, {
            timedOut: true,
            isError: true,
            stderr: "",
            stdout: "",
            combined: ""
          })
        }
        return cb(new Error("unable to contact container: " + err))
      }

      if (!res || !res.body)
        return cb(new Error("empty response from container"))

      cb(null, res.body)
    })
  }

  instance() {
    return this.instance
  }

  setIp(ip) {
    if (ip) {
      this.ip = ip
    }
  }


  /*
   * Cleans up the resources used by the container.
   */
  cleanup(cb) {
    if (this.cleanedUp === true) {
      return async.nextTick(cb)
    }

    const stages = [
      /*
       * Stop the container
       */
      this.instance.stop.bind(this.instance),

      /*
       * Remove the container
       */
      this.instance.remove.bind(this.instance, {force: true}),

      /*
       * Mark the container as cleaned up
       */
      (next) => {
        this.cleanedUp = true
        async.nextTick(next)
      }
    ];

    async.series(stages, cb)
  }
}

module.exports = Container
