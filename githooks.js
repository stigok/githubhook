#!/usr/bin/env node

const successCommand = process.env.SUCCESS_COMMAND || 'echo Success!'
const secretToken = process.env.SECRET_TOKEN || '42isthemagicnumber'
const port = process.env.PORT || 61750

const http = require('http')
const exec = require('child_process').exec
const url = require('url')
const crypto = require('crypto')

function logRequest(req) {
  const params = [req.method, req.url, req.connection.remoteAddress, req.headers['user-agent'] || 'no agent']
  console.log(params.join('\t'))
}

function isAuthenticated(req) {
  return validateHMAC(req.body, req.headers['X-Hub-Signature'])
}

function validateHMAC(str, checksum) {
  return crypto.createHmac('sha1', secretToken).update(str).digest('hex') === checksum
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
  if (!isAuthenticated(req)) {
    console.error('SHA1 HMAC checksum invalid')
    res.statusCode = 403
    res.write('Access denied')
    res.end()
    return
  }
  console.log('SHA1 HMAC checksum valid')
  res.statusCode = 200
  res.write('OK')
  res.end()
  runCommand()
}

http.createServer(router).listen(port, () => console.log('Listening on port ' + port))
