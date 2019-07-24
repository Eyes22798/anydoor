const path = require('path')
const mimeTypes = {
  'css': 'text/css',
  'gif': 'image/gif',
  'ico': 'image/x-icon',
  'txt': 'text/plain',
  'html': 'text/html',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'mpeg': 'audio/mpeg',
  'ogg': 'audio/ogg',
  'video': 'audio',
  'mp4': 'video/mp4',
  'application': 'application',
  'json': 'application/json',
  'js': 'application/javascript'
}

module.exports = (filePath) => {
  let ext = path.extname(filePath)
    .split('.')
    .pop()
    .toLowerCase()
  if (!ext) {
    ext = filePath
  }
  return mimeTypes[ext] || mimeTypes['txt']
}
