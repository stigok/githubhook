## Install

  - Clone repo
  - Run `npm install` in project folder

## Usage

Set required environment variables. **Defaults are not provided!**

  - `PORT` What port to listen on
  - `SECRET` Secret key used for creating HMAC digest of the payload
  - `CMD` Command to run whenever a request with a valid payload is received

Start the server with `npm start`

    PORT=3000 SECRET=sesame CMD="touch .refresh" npm start

## TODO

- [ ] Get rid of all dependencies
- [ ] Publish events to MQTT
  - [ ] Eat git webhooks on organization basis
- [ ] Different logging levels
- [ ] Bind to a domain in proxy (???)

## References

- https://developer.github.com/webhooks/
