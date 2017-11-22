# url-provider
Rise Vision Url Provider

 - Receives GCS URL requests including a token from [Messaging Service](https://github.com/Rise-Vision/messaging-service)
 - Verifies token and responds with a signed GCS URL
 - Token contains timestamp, filePath, displayId, hash

### Integration test requirements
 - redis-server must be runnable via cp.spawn("redis-server");
 - Google signed url credential should be passed on the command line via `GOOGLE_APPLICATION_CREDENTIALS=/path/to/credential.json npm run test`
