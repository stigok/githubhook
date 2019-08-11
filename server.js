#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const exec = require('child_process').exec

const port = process.env.PORT || 3000
const secret = process.env.SECRET
const successCommand = process.env.CMD

// GitHub: X-Hub-Signature
// Gogs:   X-Gogs-Signature
const sigHeaderName = process.env.HEADER_KEY_NAME || 'X-Hub-Signature'

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

// Request body validator
function verifyPostData(req, res, next) {
  const payload = JSON.stringify(req.body)
  if (!payload) {
    return next('Request body empty')
  }

  const hmac = crypto.createHmac('sha1', secret)
  const digest = 'sha1=' + hmac.update(payload).digest('hex')
  const checksum = req.get(sigHeaderName)
  if (!checksum || !digest || checksum !== digest) {
    return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
  }

  console.log('Checksum verified', checksum)
  return next()
}

// Git web hook
app.post('/', verifyPostData, function (req, res) {
  exec(successCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(err)
      console.error('stderr:', stderr)
    } else {
      console.log(`Success! Command returned ${stdout} (0)`)
    }
  })

  res.status(200).send('Request body was signed')
})

// Handle all errors and exceptions
app.use((err, req, res, next) => {
  if (err) console.error(err)
  res.status(403).send('Request body was not signed or verification failed')
})

app.listen(port, () => console.log('Listening on port ' + port))
