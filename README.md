# url-provider
Rise Vision Url Provider

 - Receives GCS URL requests including a token from [Messaging Service](https://github.com/Rise-Vision/messaging-service)
 - Verifies token and responds with a signed GCS URL
 - Token contains timestamp, filePath, displayId, hash
