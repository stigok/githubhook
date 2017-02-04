## Install

  - Clone repo
  - Run `npm install --global` in project folder to install the `githubhook` binary

## Usage

Set required environment variables. **Defaults are not provided!**

  - `PORT` What port to listen on
  - `SECRET` Secret key used for creating HMAC digest of the payload
  - `CMD` Command to run whenever a request with a valid payload is received

Start the server with `githubhook`

### Example

    PORT=3000 SECRET=sesame CMD="touch trigger.refresh" nodemon -d 1 -e refresh -x "git pull && npm start"

Where `nodemon` runs the command specified by `-x`, and restarts it whenever a file with extension `-e` is updated. The `githubhook` executes `touch trigger.refresh` whenever a valid payload is sent to the HTTP server.

## TODO

- [ ] Get rid of all dependencies
- [ ] Publish events to MQTT
  - [ ] Eat git webhooks on organization basis
- [ ] Different logging levels
- [ ] Bind to a domain in proxy (???)

## References

- https://developer.github.com/webhooks/
