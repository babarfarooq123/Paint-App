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
app.use("/app.js", express.static("app.js"));
app.use('/style.css', express.static('style.css'));
const pather = require('path');

const tree = dirTree('');
// console.log(tree);

var loginUser = 'a1cdxN9h5BT6dO39CAj4SPLiCBi1';
var parentDir = '';
var imageName = '';
var folderPath = '';


app.get("/", function(req, res) {
    // var path = imgLoad();
    // req.data.canvasres.write(imgLoad());
    // res.sendFile()
    res.sendFile(__dirname + "/index.html");
    // res.end();
})
app.get("/back", function(req, res) {
    // setTimeout(() => {
    // console.log(JSON.stringify(path));
    res.write(imgLoad());
    // res.end();
    // }, 500)
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

function imgLoad() {

    // setTimeout(() => {
    var set;
    for (var i = 0; i < parentDir.length; i++) {
        // ['val-1', 'val-2'].map((val, i) => {
        if (loginUser != parentDir[i]) {
            fs.readdir(__dirname + '/public/unrelabeled/' + parentDir[i], (err, files) => { set = files })

            if (set) {

                for (var j = 0; j < set.length; j++) {

                    const result = getAllDirFiles(__dirname + '/public/unrelabeled/' + parentDir[i] + '/' + files[j]);
                    // console.log(files[j]);
                    const tree = dirTree('./public/unrelabeled/' + parentDir[i] + '/' + files[j] + '/', { extensions: /\.jpg$/ });
                    const tree1 = dirTree('./public/relabeled/' + loginUser + '/' + files[j] + '/', { extensions: /\.png$/ });
                    // console.log(tree1);
                    // console.log(files[j]);
                    // tree.children.map((res, index) => {
                    //     path = JSON.stringify(res.path);
                    // })
                    console.log(tree.children.length);
                    // console.log(tree1?tree1.children:'');

                    for (var k = 0; k < tree.children.length; k++) {

                        if (tree1 != null) {

                            // console.log('imgLoad => '+imageName+'folderPath => '+folderPath);
                            // if(tree1.children[j] != null){
                            console.log('k => ' + k);
                            if (tree1.children[k] != null && tree1.children[k].name != null) {
                                // console.log('warka dang');
                                continue;
                                // if( tree.children[k].name.split('.')[0] != tree1.children[k].name.split('.')[0]){
                                //     folderPath = './public/relabeled/'+loginUser+'/'+files[j];
                                //     imageName = tree.children[k].name.split('.')[0];
                                //     path = JSON.stringify(tree.children[k].path);
                                //     return path;}else
                            } else {
                                // continue;
                                folderPath = './public/relabeled/' + loginUser + '/' + files[j];
                                imageName = tree.children[k].name.split('.')[0];
                                path = JSON.stringify(tree.children[k].path);
                                return path;
                            }
                            // }
                        } else {
                            //     console.log('loop ka andar tree => ',tree.children[k].name);
                            // console.log('loop ka andar tree1 => ',tree1.children[k].name);
                            var check = 0;
                            // console.log('agaya else me!', tree.children[k].path);`
                            fs.mkdir(pather.join('./public/relabeled/' + loginUser + '/', files[j]), (err) => {
                                if (err) {

                                }
                                console.log('Directory created successfully!');
                            });
                            // console.log('folder path',tree.children[k]);
                            folderPath = './public/relabeled/' + loginUser + '/' + files[j];
                            imageName = tree.children[k].name.split('.')[0];
                            path = JSON.stringify(tree.children[k].path);
                            return path;
                        }
                    }
                    // console.log(tree1);
                }

            }
            // });
            // break;
        } else {
            continue;
        }
        break;

        // })
    }
    // path = JSON.stringify('public/unrelabeled/FYOtlB5AmuYm7TKiKmM6sgmdi4C2/4ecf0764-bb0b-47e1-809f-0cc6ae2202a7/image_0.jpg');
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
        fs.writeFile(folderPath + '/' + imageName + '.png', buf, function(err) {
            console.log("The file was saved!");
            folderPath = '';
            imageName = '';
        });
    }
    // res.setHeader('Content-Type', 'text/plain');
    // res.redirect('/hello.html');

    // console.log(imgLoad());
    // path = imgLoad();
    setTimeout(() => {
        // console.log(JSON.stringify(path));
        res.write(imgLoad());
        res.end();
    }, 1000)

});

// app.get("/getImage",function(req,res){
//    res.end("/public/unrelabeled/a1cdxN9h5BT6dO39CAj4SPLiCBi1/3c0a7fa7-d124-4490-8846-949d5a5fcfbe/image_0.jpg");

// })

app.listen(3000);