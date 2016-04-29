# Rotating Writable

Rotating Writable is an hourly, auto-rotating writable stream, where the suffix might be `2016-4-29-15`. It's built to implement a logger compatible with Amazon Elastic Beanstalk's [Enhanced Health Checking](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/health-enhanced-serverlogs.html).

By default, Rotating Writable opens files as append. It passes options through to [fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options), so set the `flags` as you please to change.

Rotating Writable also defaults to application.log as a filename, if the specified path is found to be a directory. This [might be a mis-feature](#Caution).

# Install

`npm install rotating-writable`

# Use

Rotating Writable should fairly transparently substitute in for fs.createWriteStream, but instead of returning the stream, it will return a function which returns the current stream: all operations should call the getter and issue their writes to the current stream instance.

# Example

A trivial application might look like-

```javascript
var rotating = require("rotating-writable")
rotating().write("application starting")
setTimeout(function(){
	rotating().write("application ending")
	rotating.end("application finished")
}, 500)
```

# Caution

Creating a rotating writable issues a fs.statSync. It is not expected that apps need to keep creating rotating writables. If you do have this use case, please submit a PR, perhaps an option to skip this
