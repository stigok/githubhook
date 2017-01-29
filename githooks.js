#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const exec = require('child_process').exec

const port = process.env.PORT || 61750
const secret = process.env.SECRET_TOKEN || 'secret'
const successCommand = process.env.SUCCESS_COMMAND || 'echo Success!'

const app = express()
const hmac = crypto.createHmac('sha1', secret)

app.use((req, res, next) => {
  console.log(req.method, req.ip, Date.now())
  next()
})

// Validate request bodies
app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    const checksum = req.headers['x-hub-signature']
    const digest = 'sha1=' + hmac.update(buf).digest('hex')
    console.log('Comparing checksums', checksum, digest)
    if (checksum !== digest) {
      throw new Error(`Checksum did not match digest ${digest}`)
    } else {
      console.log('Checksum verified')
    }
  }
}))

// Git web hook
app.post('/', function (req, res, next) {
  if (!req.body) {
    console.error('Request body empty')
    return next()
  }

  exec(successCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      console.error(stderr)
    } else {
      console.log('Success! Command returned: ', stdout)
    }
  })

  res.send('Success')
})

app.use((err, req, res, next) => {
  console.error('500 Server error', err)
  res.status(403).send('Access denied')
})

app.listen(port, () => console.log('Listening on port ' + port))
