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

In a setup where a Node.js app folder is watched by `nodemon`, it runs the
`--exec` process and restarts it whenever a file with a specific extension is
touched.

    nodemon --watch "./" --ext "refresh" --delay "1" --exec "git pull && npm start"

The `githubhook` executes `touch trigger.refresh` whenever a valid payload is
sent to the HTTP server.

    PORT=3000 SECRET=sesame CMD="touch trigger.refresh" githubhook

## References

- https://developer.github.com/webhooks/
