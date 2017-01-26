#!/usr/bin/env node

const successCommand = process.env.SUCCESS_COMMAND || 'echo Success!'
const secretToken = process.env.SECRET_TOKEN || '42isthemagicnumber'
const port = process.env.PORT || 61750

const http = require('http')
const exec = require('child_process').exec
const url = require('url')

function logRequest(req) {
  const params = [req.method, req.url, req.connection.remoteAddress, req.headers['user-agent'] || 'no agent']
  console.log(params.join('\t'))
}

function isAuthenticated(req) {
  const qs = url.parse(req.url, true).query
  return qs['token'] === secretToken
}

function runCommand() {
  exec(successCommand, (err, stdout, stderr) => {
    if (err) {
      console.error('Command execution exited with errors')
      console.error('err:', err)
      console.error('stderr:', stderr)
      return;
    }
    console.log('Command executed successfully')
    console.log('stdout:', stdout)
  })
}

const router = function (req, res, next) {
  logRequest(req)
  if (isAuthenticated(req)) {
    res.statusCode = 200
    runCommand()
    res.write('OK')
  } else {
    res.statusCode = 403
    res.write('ACCESS DENIED')
  }
  res.end()
}

http.createServer(router).listen(port, () => console.log('Listening on port ' + port))
