const { createGzip, createDeflate } = require('zlib')

module.exports = (rs, req, res) => {
  const acceptEncoding = req.headers['accept-encoding']
  if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)/)) {
    // 不是以上情况，直接返回 rs
    return rs
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    // 采用 gzip 压缩规则
    // 在相应头中设置其压缩方式
    res.setHeader('Content-Encoding', 'gzip')
    return rs.pipe(createGzip())
  } else if (acceptEncoding.match(/\bdeflate\b/)) {
    res.setHeader('Content-Encoding', 'deflate')
    return rs.pipe(createDeflate())
  }
}
