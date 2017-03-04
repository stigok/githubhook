#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const exec = require('child_process').exec
const winston = require('winston')

const port = process.env.PORT || 3000
const secret = process.env.SECRET
const successCommand = process.env.CMD
const headerKey = process.env.HEADER_KEY_NAME || 'x-gogs-signature'
const verbose = process.argv.includes('--verbose')
const log = new winston.Logger({
  level: verbose ? 'verbose' : 'warn',
  transports: [
    new (winston.transports.Console)()
  ]
})

log.log('asd')

if (!secret) {
  log.error('No secret set')
  process.exit(1)
}

if (!successCommand) {
  log.error('No success command set!')
  process.exit(1)
}

log.verbose(`env: port ${port},${secret.length ? '' : 'NOT'} using secret, cmd "${successCommand}"`)
log.verbose(`cwd: ${process.cwd()}`)

const app = express()

// Log all requests
app.use((req, res, next) => {
  const date = new Date();
  log.info(date.toString(), req.ip, req.method, req.path)
  next()
})

app.use(bodyParser.json())

// Validate request bodies
function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body)
  if (!payload || !payload.length) {
    return next('Request body empty')
  }

  const hmac = crypto.createHmac('sha1', secret)
  const digest = 'sha1=' + hmac.update(payload).digest('hex')
  const checksum = req.headers[headerKey]
  if (!checksum || !digest || checksum !== digest) {
    next(`Request body digest (${digest}) did not match ${headerKey} (${checksum})`)
    return next()
  } else {
    log.verbose('Checksum verified', checksum)
    return next()
  }
}

// Git web hook
app.post('/', verifyPostData, function (req, res, next) {
  exec(successCommand, (err, stdout, stderr) => {
    if (err) {
      log.error('Success command failed', err)
      log.verbose(stderr)
    } else {
      log.verbose(`Success! Command returned ${stdout} (0)`)
      try {
        // Print repo name to stdout
        console.log(req.body.repository.full_name)
      } catch (e) {
        log.error('Payload not in expected format\n', e)
        res.status(406).send('Unexpected payload')
        return
      }
    }
  })

  res.status(200).send('Success')
})

// Handle all errors and exceptions
app.use((err, req, res, next) => {
  log.error('500 Server error', err)
  res.status(403).send('Access denied')
})

app.listen(port, () => log.info('Listening on port ' + port))
