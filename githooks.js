#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const exec = require('child_process').exec

const port = process.env.PORT || 3000
const secret = process.env.SECRET
const successCommand = process.env.CMD
const headerKey = process.env.HEADER_KEY_NAME || 'x-hub-signature'

if (!secret) {
  console.error('No secret set!')
  process.exit(1)
}

if (!successCommand) {
  console.error('No success command set!')
  process.exit(1)
}

console.log(`env: port "${port}", secret "${secret.replace(/./g, '*')}", cmd "${successCommand}"`)
console.log(`cwd: ${process.cwd()}`)

const app = express()

// Log all requests
app.use((req, res, next) => {
  const date = new Date();
  console.log(date.toString(), req.ip, req.method, req.path)
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
    next(`Request body digest (${digest}) did not match header[${headerKey}] (${checksum})`)
    return next()
  } else {
    console.log('Checksum verified', checksum)
    return next()
  }
}

// Git web hook
app.post('/', verifyPostData, function (req, res, next) {
  exec(successCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      console.error(stderr)
    } else {
      console.log(`Success! Command returned ${stdout} (0)`)
    }
  })

  res.send('Success')
})

// Handle all errors and exceptions
app.use((err, req, res, next) => {
  console.error('500 Server error', err)
  res.status(403).send('Access denied')
})

app.listen(port, () => console.log('Listening on port ' + port))
