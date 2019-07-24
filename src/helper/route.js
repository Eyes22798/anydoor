const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const Handlebars = require('handlebars')
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const mime = require('./mime')
const compress = require('./compress')
const range = require('./range')
const isFresh = require('./cache')

// 同步读取模板引擎
const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())

module.exports = async function (req, res, filePath, config) {
  // 读取文件状态并判断
  try {
    // 文件或者文件夹存在的情况
    const stats = await stat(filePath)
    if (stats.isFile()) {
      // 如果是文件的话，取出其类型
      const contentType = mime(filePath)
      res.setHeader('Content-Type', `${contentType};charset=utf-8`)
      if (isFresh(stats, req, res)) {
        console.log(11)
        res.statusCode = 304
        res.end()
        return
      }
      let rs
      const { code, start, end } = range(stats.size, req, res)
      if (code === 200) {
        // 不能处理，读取全部内容
        res.statusCode = 200
        rs = fs.createReadStream(filePath)
      } else {
        // 读取全部内容
        res.statusCode = 206
        rs = fs.createReadStream(filePath, { start, end })
      }
      // 通过流的方式读取文件，并把它赋给客户端
      // 然后选择压缩方式
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res)
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath)
      const dir = path.relative(config.root, filePath)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html;charset=utf-8')
      const data = {
        title: path.basename(filePath),
        dir: dir ? `/${dir}` : '',
        files
      }
      res.end(template(data))
    }
  } catch (ex) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.end(`${filePath} is not a directory or file\n ${ex.toString()}`)
  }
}
