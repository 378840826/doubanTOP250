//爬豆瓣电影 top250
/*
1，下载网页内容
2，分析网页结构
3，用库读取和获得想要的数据
4，保存数据
*/

//定义 log 函数
const log = function() {
    console.log.apply(console, arguments)
}

//需要用到三个库()
//用于下载网页的 sync-request 库
var request = require('sync-request')
//用于解析网页数据的 cherrio 库
// cherrio 语法类似于 jQuery
var cheerio = require('cheerio')
//用于文件操作的 fs 库
var fs = require('fs')


//定义一个类保存各电影信息
//es5定义类的方法
const Movie = function() {
    this.name = ''
    this.score = 0
    this.quote = ''
    this.ranking = 0
    this.coverUrl = ''
}

//es6 定义类的方法,作用和 ES5 是一样的
// class Movie {
//     // constructor 构造函数的套路
//     constructor() {
//         this.name = ''
//         this.score = 0
//         this.quote = ''
//         this.ranking = 0
//         this.coverUrl = ''
//     }
// }



// 从一个 div 中获取需要的数据，生成一个对象
var moviesFromDiv = function(div) {
    //用库的方法把 div 转成可操作的 dom 对象 e, 这个对象可以使用选择器语法
    var e = cheerio.load(div)
    //创建一个实例对象用来存储数据
    //这些数据都是从 html 结构中人工分析出来的
    var movie = new Movie()
    movie.name = e('.title').text()
    movie.score = e('.rating_num').text()
    movie.quote = e('.inq').text()
    var pic = e('.pic')
    movie.ranking = pic.find('em').text()
    movie.coverUrl = pic.find('img').attr('src')
    //添加评论人数数据
    movie.ratings = e('.star').find('span').last().text().slice(0, -3)
    return movie
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


//下载和解析网页数据的函数
var moviesFromUrl = function(url) {
    //把数据缓存起来
    var body = cached_url(url)

    //用 cheerio 库的 load 方法把 下载的 html 解析成可操作的 DOM
    var e = cheerio.load(body)
    //可以用选择器语法操作 cherrio.load 返回的 e 对象
    //获得包含电影信息的全部 div (分析网页结构，找出相应的 class .item)
    var movieDiv = e('.item')
    //遍历这些 div 得到想要的数据
    var movies = []
    for (var i = 0; i < movieDiv.length; i++) {
        var div = movieDiv[i]
        //取出每个 div 的 html 内容
        var d = e(div).html()
        //交给 moviesFromDiv 函数来生成一个 movie 对象 m
        var m = moviesFromDiv(d)
        //push 到一个数组中保存
        movies.push(m)
    }
    return movies
}


//保存信息至文件的函数
var saveMovies = function(movies) {
    //把数组参数 movies 转成 JSON 格式
    //JSON.stringily 的第 2、3 个参数是用来让生成的数据带有缩进
    //第三个参数指定缩进的空格数，建议当作套路使用
    var s = JSON.stringify(movies, null, 2)
    //引入用于文件操作的 fs 模块
    var fs = require('fs')
    //创建用于保存数据的文件
    var path = 'douban.txt'
    //用 fs 模块写入数据，第一个参数是文件名，第二个参数是要写入的内容
    fs.writeFileSync(path, s)
}


//新增下载封面图
var downloadCovers = function(movies) {
    //用于下载的 request 库，小区别于 sync-request
    //用于文件操作的 fs 库
    var request = require('request')
    var fs = require('fs')
    for (var i = 0; i < movies.length; i++) {
        var m = movies[i]
        var url = m.coverUrl
        var path = m.name.split('/')[0]
        var path1 = 'imges'
        var path2 = path1 + '/' + path + '.jpg'
        //创建一个文件夹
        fs.mkdir(path1,function(err) {
            
        })
        //下载图片并保存的套路
        request(url).pipe(fs.createWriteStream(path2))
    }
}


//主函数
const __main = function() {
    //top250 共有 10 个页面,一个页面 25 个数据，找出规律循环 10 次
    var movies = []
    for (var i = 0; i < 10; i++) {
        var start = i * 25
        const url = 'https://movie.douban.com/top250?start=' + start
        //自定义一个 moviesFromUrl 函数接收一个 url 参数
        //这个函数里做了三件事
        //下载网页，解析网页信息
        var ms = moviesFromUrl(url)
        //把 ms 数组中的元素都添加到 movies 数组中
        //concat 是连接两个数组成一个数组
        movies = movies.concat(ms)
    }
    //用 saveMovies 保存数据
    saveMovies(movies)
    //下载封面图片并保存
    downloadCovers(movies)
}
//程序入口
__main()
