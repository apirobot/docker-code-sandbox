let _ = require('lodash')
let async = require('async')
let child_process = require('child_process')
let fs = require('fs')
let path = require('path')
let rmdir = require('rimraf')
let uuid = require('uuid').v4
let extensions = require('./extensions')

const JAVASCRIPT_REQUIRED_CODE = `
const print = (data) => console.log(data);

const readline = () => {
  return new Promise((resolve) => {
    const _readline = require('readline');

    const _rl = _readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    _rl.on('line', (_stdin) => {
      resolve(_stdin);
    });
  })
};
`

class ExecutorService {
  execute (code, languageName, stdin, timeoutMs, cb) {
    stdin = [].concat(stdin)
    let output = [...Array(stdin.length)]
      .map(_ => ({ stdout: '', stderr: '', combined: '' }))

    const executor = __dirname + '/executors/' + languageName + '.sh'
    if (!fs.existsSync(executor)) {
      throw new Error("I don't know how to execute the " + languageName + " language")
    }

    const { dirname, filename } = this._createExecutionFile({ languageName, code })

    async.eachOfSeries(stdin, function (stdin_, index, callback) {
      const job = child_process.spawn(executor, [ filename ], { cwd: __dirname })

      job.stdin.setEncoding('utf8')

      if (stdin_) {
        job.stdin.write(stdin_)
      }

      job.stdout.on('data', function (data) {
        output[index].stdout += data
        output[index].combined += data
      })

      job.stderr.on('data', function (data) {
        output[index].stderr += data
        output[index].combined += data
      })

      job.stdin.end()

      const timeoutCheck = setTimeout(function () {
        console.error("Process timed out. Killing")
        job.kill('SIGKILL');
        output[index] = _.assign(output[index], { timedOut: true, isError: true, killedByContainer: true });
      }, timeoutMs)

      job.on('close', function (exitCode) {
        clearTimeout(timeoutCheck);
        output[index] = _.assign(output[index], { isError: exitCode != 0 })
        callback()
      })
    }, function (err) {
      rmdir(dirname, _.noop)
      cb(output)
    })
  }
  _createExecutionFile ({ languageName, code }) {
    const dirname = path.join('temp', uuid())
    fs.mkdirSync(dirname)

    const filename = path.join(dirname, 'code' + (extensions[languageName] || ''))
    switch (languageName) {
      case 'javascript':
        fs.writeFileSync(filename, JAVASCRIPT_REQUIRED_CODE + code)
        break
      default:
        fs.writeFileSync(filename, code)
    }

    return { dirname, filename }
  }
}

module.exports = new ExecutorService();
