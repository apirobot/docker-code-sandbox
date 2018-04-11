let _ = require('lodash')
let async = require('async')
let child_process = require('child_process')
let fs = require('fs')
let path = require('path')
let rmdir = require('rimraf')
let uuid = require('uuid').v4
let extensions = require('./extensions')


class ExecutorService {
  execute (code, languageName, stdin, timeoutMs, cb) {
    stdin = [].concat(stdin)
    let output = [...Array(stdin.length)]
      .map(_ => ({ stdout: '', stderr: '', combined: '' }))

    const executor = __dirname + '/executors/' + languageName + '.sh'
    if (!fs.existsSync(executor)) {
      throw new Error("I don't know how to execute the " + languageName + " language")
    }

    async.eachOf(stdin, function (stdin_, index, callback) {
      const dirname = path.join('temp', uuid())
      fs.mkdirSync(dirname)
      const filename = path.join(dirname, 'code' + (extensions[languageName] || ''))
      fs.writeFileSync(filename, code)

      const job = child_process.spawn(executor, [ filename ], { cwd: __dirname })

      if (stdin_) {
        job.stdin.setEncoding('utf8')
        job.stdin.write(stdin_)
        job.stdin.end()
      }

      job.stdout.on('data', function (data) {
        output[index].stdout += data
        output[index].combined += data
      })

      job.stderr.on('data', function (data) {
        output[index].stderr += data
        output[index].combined += data
      })

      const timeoutCheck = setTimeout(function () {
        console.error("Process timed out. Killing")
        job.kill('SIGKILL');
        output[index] = _.assign(output[index], { timedOut: true, isError: true, killedByContainer: true });
      }, timeoutMs)

      job.on('close', function (exitCode) {
        clearTimeout(timeoutCheck);
        rmdir(dirname, _.noop)
        output[index] = _.assign(output[index], { isError: exitCode != 0 })
        callback()
      })
    }, function (err) {
      cb(output)
    })
  }
}

module.exports = new ExecutorService();
