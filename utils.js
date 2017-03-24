//保存信息至文件的函数
var saveJSON = function(path, json) {
    //把数组参数 movies 转成 JSON 格式
    //JSON.stringily 的第 2、3 个参数是用来让生成的数据带有缩进
    //第三个参数指定缩进的空格数，建议当作套路使用
    var s = JSON.stringify(json, null, 2)
    //引入用于文件操作的 fs 模块
    var fs = require('fs')
    //用 fs 模块写入数据
    //第一个参数是文件名，第二个参数是要写入的内容，三是回调函数
    fs.writeFileSync(path, s, function(error) {
        if (error != null) {
            console.log('***写入文件错误***', error)
        } else {
            console.log('---保存成功---')
        }
    })
}


//定义 log 函数
var log = function() {
    console.log.apply(console, arguments)
}


//缓存网页数据以便多次使用的时候不再重复下载
var cached_url = function(url) {
    //引入 fs 模块
    var fa = require('fs')
    //判断文件是否已存在，不存在就下载，已存在就读取
    //定义一个文件名 path,用 url 后面部分来命名
    var path = url.split('?')[1] + '.html'
    // fs.statSync() 检查文件是否存在
    var exists = fs.existsSync(path)
    if (exists) {
        //如果存在,就读取
        var data = fs.readFileSync(path)
        //返回 body
        return data
    } else {
        //引入用于下载网页的 sync-request 库，和用于解析网页数据的 cherrio 库
        var request = require('sync-request')
        // cherrio 语法类似于 jQuery
        //var cheerio = require('cheerio')
        //套路，用'GET'方法获取 URL 的内容，相当于在浏览器中输入 url 获得的内容
        //r 相当于发送一个 http 请求后返回的对象
        var r = request('GET', url)
        //用 request 库的 getBody 方法得到 http请求的 body(也就是整个html)
        //也就是 http 请求结果的 Response，参数是指定编码
        var body = r.getBody('utf-8')
        //把下载的内容写入缓存文件
        fs.writeFileSync(path, body)
        //返回 body
        return body
    }
}

/*
通过 exports 制作自己的模块
*/
exports.save = saveJSON
exports.log = log
exports.cached_url = cached_url
