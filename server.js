var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
// var countFiles = require('count-files');
const dirTree = require("directory-tree");
app.use(express.json());
app.use(express.urlencoded());

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use("/app.js",express.static("app.js"));
app.use('/style.css', express.static('style.css'));

const tree = dirTree('');
console.log(tree);

var loginUser = 'a1cdxN9h5BT6dO39CAj4SPLiCBi1';
var parentDir = '';


app.get("/",function(req,res){
    var path = imgLoad();
    res.sendFile(__dirname+"/index.html");
    // res.end();
})


fs.readdir(__dirname + '/public/unrelabeled', (err, files) => {
    parentDir = files;
    // console.log(parentDir);
});

const getAllDirFiles = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(file)
        }
    })
    return arrayOfFiles
}

var path = '';
function imgLoad(){
// setTimeout(() => {
    for(var i=0; i<parentDir.length; i++){
    // ['val-1', 'val-2'].map((val, i) => {
        if (loginUser != parentDir[i]) {
            fs.readdir(__dirname + '/public/unrelabeled/' + parentDir[i], (err, files) => {
                for (var j = 0; j < files.length; j++) {

                    const result = getAllDirFiles(__dirname + '/public/unrelabeled/' + parentDir[i] + '/' + files[j]);
                    // console.log(files[j]);
                    const tree = dirTree('./public/unrelabeled/' + parentDir[i] + '/' + files[j] + '/', { extensions: /\.jpg$/ });
                    const tree1 = dirTree('./public/relabeled/' + parentDir[i] + '/' + files[j] + '/', { extensions: /\.jpg$/ });
                    console.log(tree1);
                    tree.children.map((res, index) => {
                        path = JSON.stringify(res.path);
                    })
                }
            });
            break;
        }
    // })
    }
return path;
// }, 1000);
}


// app.post('/', (req, res) => {
//     console.log('req => ', req.body);
// })


// var stats = countFiles(__dirname+'/images', function (err, results) {
//     console.log('done counting')
//     console.log(results) // { files: 10, dirs: 2, bytes: 234 }
//   })

//   setInterval(function () {
// { files: 4, dirs: 1, bytes: 34 }
//   }, 500)
// setTimeout(() => {
//     console.log('current count', stats.dirs)
// }, 1000);

app.post('/', function(req, res) {
    var dataUrl = req.body.img;
    console.log(dataUrl);

    var post = "";
    post = JSON.parse(req.body.canvas);
    var data = post.replace(/^data:image\/\w+;base64,/, "");
    var buf = Buffer.from(data, 'base64');
    writeFileToSystem(buf);

    function writeFileToSystem(buf) {
        fs.writeFile("upload/image.png", buf, function(err) {
            console.log("The file was saved!");
        });
    }
    // res.setHeader('Content-Type', 'text/plain');
    // res.redirect('/hello.html');
    
    // console.log(imgLoad());
    path = imgLoad()
    setTimeout(() => {
        res.write(path);
        res.end();
    }, 1000)

});

// app.get("/getImage",function(req,res){
//    res.end("/public/unrelabeled/a1cdxN9h5BT6dO39CAj4SPLiCBi1/3c0a7fa7-d124-4490-8846-949d5a5fcfbe/image_0.jpg");
    
// })

app.listen(3000);