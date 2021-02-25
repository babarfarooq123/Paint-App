/************************************************************************
 *
 * Eloquent JavaScript
 * by Marijn Haverbeke
 *
 * Chapter 19
 * Project: A Paint Program
 *
 * Just so you know, most of this code is Marijn's, comments are mine. 
 * This exercise is meant to be a fun way of exploring how JavaScript can 
 * interact with form elements while reviewing previous material in the
 * book. If you want to learn how to program with JavaScript, I sincerely 
 * hope you check his book out. It's free online:
 *
 * http://eloquentjavascript.net/
 *
 * but I suggest buying it and marking it all up with your own notes
 * and thoughts.
 *
 * Now, TO THE CODE!!!
 *
 * Ryan Boone
 * falldowngoboone@gmail.com
 *
 ***********************************************************************/

// the core of the program; appends the paint interface to the
// DOM element given as an argument (parent)



var liner = 1;
var cx = ''
function createPaint(parent) {
    var canvas = elt('canvas', { id: 'paintCanvas' });
    var cx = canvas.getContext('2d');
    var toolbar = elt('div', { class: 'toolbar' });

    // calls the every function in controls, passing in context,
    // then appending the returned results to the toolbar
    for (var name in controls)
        toolbar.appendChild(controls[name](cx));

    var panel = elt('div', { class: 'picturepanel' }, canvas);
    parent.appendChild(elt('div', null, panel, toolbar));
}

/************************************************************************
 * helper functions
 ***********************************************************************/

// creates an element with a name and object (attributes)
// appends all further arguments it gets as child nodes
// string arguments create text nodes
// ex: elt('div', {class: 'foo'}, 'Hello, world!');
function elt(name, attributes) {
    var node = document.createElement(name);
    if (attributes) {
        for (var attr in attributes)
            if (attributes.hasOwnProperty(attr))
                node.setAttribute(attr, attributes[attr]);
    }
    for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];

        // if this argument is a string, create a text node
        if (typeof child == 'string')
            child = document.createTextNode(child);
        node.appendChild(child);
    }
    return node;
}

// figures out canvas relative coordinates for accurate functionality
function relativePos(event, element) {
    var rect = element.getBoundingClientRect();
    return {
        x: Math.floor(event.clientX - rect.left),
        y: Math.floor(event.clientY - rect.top)
    };
}

// registers and unregisters listeners for tools
function trackDrag(onMove, onEnd) {
    function end(event) {
        removeEventListener('mousemove', onMove);
        removeEventListener('mouseup', end);
        if (onEnd)
            onEnd(event);
    }
    addEventListener('mousemove', onMove);
    addEventListener('mouseup', end);
}

// loads an image from a URL and replaces the contents of the canvas
function 
loadImageURL(cx, url) {
    var image = document.createElement('img');
    image.addEventListener('load', function() {
        var color = cx.fillStyle,
            size = cx.lineWidth;
        cx.canvas.width = image.width;
        cx.canvas.height = image.height;
        cx.drawImage(image, 0, 0);
        cx.fillStyle = color;
        cx.strokeStyle = color;
        cx.lineWidth = size;
    });
    // image.src = url;
    document.getElementById('paintCanvas').style.backgroundImage = `url(${url})`;
}

// used by tools.Spray
// randomly positions dots
function randomPointInRadius(radius) {
    for (;;) {
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;
        // uses the Pythagorean theorem to test if a point is inside a circle
        if (x * x + y * y <= 1)
            return { x: x * radius, y: y * radius };
    }
}

/************************************************************************
 * controls
 ***********************************************************************/

// holds static methods to initialize the various controls;
// Object.create() is used to create a truly empty object
var controls = Object.create(null);

controls.tool = function(cx) {
    var select = elt('select');

    // populate the tools
    for (var name in tools)
        select.appendChild(elt('option', null, name));

    // calls the particular method associated with the current tool
    cx.canvas.addEventListener('mousedown', function(event) {

        // is the left mouse button being pressed?
        if (event.which == 1) {

            // the event needs to be passed to the method to determine
            // what the mouse is doing and where it is
            tools[select.value](event, cx);
            // don't select when user is clicking and dragging
            event.preventDefault();
        }
    });

    return elt('span', null, 'Tool: ', select);
};

// color module
controls.color = function(cx) {
    var input = elt('input', { id: 'getColor', type: 'color' });

    // on change, set the new color style for fill and stroke
    input.addEventListener('change', function() {
        cx.fillStyle = input.value;
        cx.strokeStyle = input.value;
    });
    return elt('span', null, 'Color: ', input);
};

// brush size module
controls.brushSize = function(cx) {
    var select = elt('select');

    // various brush sizes
    var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];

    // build up a select group of size options
    sizes.forEach(function(size) {
        select.appendChild(elt('option', { value: size }, size + ' pixels'));
    });

    // on change, set the new stroke thickness
    select.addEventListener('change', function() {
        // console.log(select.value);
        liner = select.value;
        cx.lineWidth = select.value;
    });
    return elt('span', null, 'Brush size: ', select);
};

//Sending image data to server
function sendMessage(image) {
    console.log("yeh mera bhai chal gaya!", image)
    $.ajax({
        type: 'post',
        url: 'http://localhost:3000/',
        data: {
            'canvas': JSON.stringify(image)
        },
        success: function(e) {
            e = e.replace('"/g','');
            // console.log(e);
            // console.log(typeof(e));
            document.querySelector(".picturepanel").style.backgroundImage = `url(${e})`
            alert(e);
            // e.preventDefault();
            // console.log("response => " + e);
            // fetch('http://localhost/getImage').then((res) => {
            //         console.log('res => ', res);
            //     }).catch((e) => {
            //         console.log('error message => ', e.message());
            //     })
                // document.getElementById('paintCanvas').style.backgroundImage = `url(${JSON.parse(e)})`;
        }
    })

}


// save
controls.save = function(cx) {
    // MUST open in a new window because of iframe security stuff
    var link = elt('p', {}, 'Save');

    function update() {
        try {
            var img = cx.canvas.toDataURL();
            sendMessage(img);
        } catch (e) {}
    }
    // link.addEventListener('mouseover', update);
    // link.addEventListener('focus', update);
    link.addEventListener('click', update)
    return link;
};

// open a file
controls.openFile = function(cx) {
    var input = elt('input', { type: 'file' });
    input.addEventListener('change', function() {
        if (input.files.length == 0) return;
        var reader = new FileReader();
        reader.addEventListener('load', function() {
            loadImageURL(cx, reader.result);
        });
        reader.readAsDataURL(input.files[0]);
    });
    return elt('div', null, 'Open file: ', input);
};

// open a URL
controls.openURL = function(cx) {
    var input = elt('input', { type: 'text' });
    var form = elt('form', null, 'Open URL: ', input,
        elt('button', { type: 'submit' }, 'load'));
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        loadImageURL(cx, form.querySelector('input').value);
    });
    return form;
};

/************************************************************************
 * tools
 ***********************************************************************/

// drawing tools
var tools = Object.create(null);

// line tool
// onEnd is for the erase function, which uses it to reset
// the globalCompositeOperation to source-over
tools.Line = function(event, cx, onEnd) {
    cx.lineCap = 'round';

    // mouse position relative to the canvas
    var pos = relativePos(event, cx.canvas);
    trackDrag(function(event) {
        cx.beginPath();

        // move to current mouse position
        cx.moveTo(pos.x, pos.y);

        // update mouse position
        pos = relativePos(event, cx.canvas);

        // line to updated mouse position
        cx.lineTo(pos.x, pos.y);

        // stroke the line
        cx.stroke();
    }, onEnd);
};

// erase tool
tools.Erase = function(event, cx) {

    // globalCompositeOperation determines how drawing operations
    // on a canvas affect what's already there
    // 'destination-out' makes pixels transparent, 'erasing' them
    // NOTE: this has been deprecated
    cx.globalCompositeOperation = 'destination-out';
    tools.Line(event, cx, function() {
        cx.globalCompositeOperation = 'source-over';
    });
};

// text tool
tools.Text = function(event, cx) {
    var text = prompt('Text:', '');
    if (text) {
        var pos = relativePos(event, cx.canvas);
        // for simplicity, text size is brush size, locked to sans-serif
        cx.font = Math.max(7, cx.lineWidth) + 'px sans-serif';
        cx.fillText(text, pos.x, pos.y);
    }
}

// spray paint tool
tools.Spray = function(event, cx) {
    var radius = cx.lineWidth / 2;
    var area = radius * radius * Math.PI;
    var dotsPerTick = Math.ceil(area / 30);

    var currentPos = relativePos(event, cx.canvas);
    var spray = setInterval(function() {
        for (var i = 0; i < dotsPerTick; i++) {
            var offset = randomPointInRadius(radius);
            cx.fillRect(currentPos.x + offset.x,
                currentPos.y + offset.y, 1, 1);
        }
    }, 25);
    trackDrag(function(event) {
        currentPos = relativePos(event, cx.canvas);
    }, function() {
        clearInterval(spray);
    });
};

/************************************************************************
 * exercises
 ***********************************************************************/

/**
 * allows the user to click and drag out a rectangle on the canvas
 *
 * @param {Object} event - mousedown event (specifically left button)
 * @param {Object} cx - the canvas 2d context object
 */
tools.Rectangle = function(event, cx) {
    var leftX, rightX, topY, bottomY
    var clientX = event.clientX,
        clientY = event.clientY;

    // placeholder rectangle
    var placeholder = elt('div', { class: 'placeholder' });

    // cache the relative position of mouse x and y on canvas
    var initialPos = relativePos(event, cx.canvas);

    // used for determining correct placeholder position
    var xOffset = clientX - initialPos.x,
        yOffset = clientY - initialPos.y;

    trackDrag(function(event) {
        document.body.appendChild(placeholder);

        var currentPos = relativePos(event, cx.canvas);
        var startX = initialPos.x,
            startY = initialPos.y;

        // assign leftX, rightX, topY and bottomY
        if (startX < currentPos.x) {
            leftX = startX;
            rightX = currentPos.x;
        } else {
            leftX = currentPos.x;
            rightX = startX;
        }

        if (startY < currentPos.y) {
            topY = startY;
            bottomY = currentPos.y;
        } else {
            topY = currentPos.y;
            bottomY = startY;
        }

        // set the style to reflect current fill
        placeholder.style.background = cx.fillStyle;

        // set div.style.left to leftX, width to rightX - leftX
        placeholder.style.left = leftX + xOffset + 'px';
        placeholder.style.top = topY + yOffset + 'px';
        placeholder.style.width = rightX - leftX + 'px';
        placeholder.style.height = bottomY - topY + 'px';
    }, function() {

        // add rectangle to canvas with leftX, rightX, topY and bottomY
        cx.fillRect(leftX, topY, rightX - leftX, bottomY - topY);

        // destroy placeholder
        document.body.removeChild(placeholder);
    });
};

/**
 * allows the user to load the color of a specific pixel
 *
 * @param {Object} event - mousedown event (specifically left button)
 * @param {Object} cx - the canvas 2d context object
 */
// TODO: rewrite with pixel object
tools['Pick Color'] = function(event, cx) {
    try {
        var colorPos = relativePos(event, cx.canvas),
            // returns an array [r, g, b, opacity];
            imageData = cx.getImageData(colorPos.x, colorPos.y, 1, 1),
            colorVals = imageData.data,
            color = '';

        // build the color
        color += 'rgb(';

        // only need first three args
        for (var i = 0; i < colorVals.length - 1; i++) {
            color += colorVals[i];

            // only need two commas
            if (i < 2)
                color += ',';
        }
        color += ')';

        // cx.fillStyle = color;
        cx.strokeStyle = color;

    } catch (e) {
        if (e instanceof SecurityError)
            alert('Whoops! Looks like you don\'t have permission to do that!');
        else
            throw e;
    }
};

// helpers for flood fill

// iterates over N, S, E and W neighbors and performs a function fn
function forEachNeighbor(point, fn) {
    fn({ x: point.x - 1, y: point.y });
    fn({ x: point.x + 1, y: point.y });
    fn({ x: point.x, y: point.y - 1 });
    fn({ x: point.x, y: point.y + 1 });
}

// checks if 2 points in data, point1 and point2, have the same color
function isSameColor(data, point1, point2) {
    var offset1 = (point1.x + point1.y * data.width) * 4;
    var offset2 = (point2.x + point2.y * data.width) * 4;

    for (var i = 0; i < 4; i++) {
        if (data.data[offset1 + i] != data.data[offset2 + i]) {
            return false;
        }
    }
    return true;
}

// end flood fill helpers

// NOTE: in my first attempt, I was creating Pixel objects and pushing them
// to isPainted instead of Booleans; that wasn't a great idea...
// I suspect there was too much initialization for the browser to handle
// and it choked fatally :(

// I think I would still like to see this done with a Pixel object, if not
// merely for the ability to extend it to done some more advanced things

/**
 * paints all adjacent matching pixels
 */
tools["Flood Fill"] = function(event, cx) {
    var imageData = cx.getImageData(0, 0, cx.canvas.width, cx.canvas.height),
        // get sample point at current position, {x: int, y: int}
        sample = relativePos(event, cx.canvas),
        isPainted = new Array(imageData.width * imageData.height),
        toPaint = [sample];

    // while toPaint.length > 0
    while (toPaint.length) {
        // current point to check
        var current = toPaint.pop(),
            id = current.x + current.y * imageData.width;

        // check if current has already been painted
        if (isPainted[id]) continue;
        else {

            // if it hasn't, paint current and set isPainted to true
            cx.fillRect(current.x, current.y, 1, 1);
            isPainted[id] = true;
        }

        // for every neighbor (new function)
        forEachNeighbor(current, function(neighbor) {
            if (neighbor.x >= 0 && neighbor.x < imageData.width &&
                neighbor.y >= 0 && neighbor.y < imageData.height &&
                isSameColor(imageData, sample, neighbor)) {
                toPaint.push(neighbor);
            }
        });
    }
};

// initialize the app
var appDiv = document.querySelector('#paint-app');
createPaint(appDiv);

/************************************************************************
 * resources
 *
 * Canvas Rendering Context 2D API
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 *
 * Eloquent JavaScript Ch 19, Project: A Paint Program
 * http://eloquentjavascript.net/19_paint.html
 ***********************************************************************/



//  zoom work

var width = 500;
var height = 300;
var difference = 10;
//  var interveralID =0;
//document.getElementById("img1").style.width=width;

//  function increase(){
// clearInterval(interveralID);
// interveralID=setInterval(expand,10);
//     expand();
//  }
//  function decrease(){
// clearInterval(interveralID);
// interveralID=setInterval(shrink,10);
//     shrink();
//  }
function expand() {
    // if(width<200){
    width = width + difference;
    height = height + difference;
    document.querySelector("#paint-app").style.width = width;
    document.querySelector("canvas").style.width = width;
    document.querySelector("#paint-app").style.height = height;
    document.querySelector("canvas").style.height = height;
    console.log(width);
    // }
}

function shrink() {
    if (width > 0) {
        width = width - difference;
        height = height + difference;
        document.querySelector("#paint-app").style.width = width;
        document.querySelector("canvas").style.width = width;
        document.querySelector("#paint-app").style.height = height;
        document.querySelector("canvas").style.height = height;
        console.log(width);
    }
    // else{
    //   clearInterval(interveralID);
    // }
}



var imgScale = 0.01;
var liner = 1;
var colorr = '#000000';
$(document).ready(function() {
    var canvas = document.getElementById("paintCanvas"),
        paintContext = paintCanvas.getContext("2d"),
        currentPathIndex = 0,
        draw = false,
        paths = [],
        scale = 1,
        scaleStep = 0.25,
        styles = {
            // lineWidth: $('select').val(),
            // strokeStyle: "#000000"
        };
    $('select').change(function(e) {
        styles = {
            lineWidth: parseInt(e.target.value),
            strokeStyle: colorr,

        }
        liner = parseInt(e.target.value)
    });
    $('#color-selector').change(function(e) {
        console.log(e.target.value)
        styles = {
            lineWidth: liner,
            strokeStyle: e.target.value.toString()
        }
        colorr = e.target.value.toString()
        $('#zoomer').trigger('click')
    });
    // console.log(elt('select').val())

    paintContext.imageSmoothingEnabled = false;
    paintContext.mozImageSmoothingEnabled = false;
    paintContext.webkitImageSmoothingEnabled = false;
    var cvSize = 500;

    var drawCanvas = document.createElement('canvas');
    var drawCtx = drawCanvas.getContext('2d');

    drawCanvas.width = drawCanvas.height = cvSize;
    canvas.width = canvas.height = cvSize;

    var context = drawCtx;

    function updatePaintCanvas() {
        paintContext.clearRect(0, 0, paintContext.canvas.width, paintContext.canvas.height);
        paintContext.save();
        paintContext.translate(cvSize * 0.5, cvSize * 0.5);
        paintContext.scale(scale, scale);
        paintContext.drawImage(drawCanvas, -cvSize * 0.5, -cvSize * 0.5);
        paintContext.restore();
        $('.picturepanel').css('transform', `scale(${1+imgScale})`);
    }
    // function updatePaintCanvas1() {
    //     paintContext.clearRect(0, 0, paintContext.canvas.width, paintContext.canvas.height);
    //     paintContext.save();
    //     paintContext.translate(cvSize * 0.5, cvSize * 0.5);
    //     paintContext.scale(scale, scale);
    //     paintContext.drawImage(drawCanvas, -cvSize * 0.5, -cvSize * 0.5);
    //     paintContext.restore();
    //     $('.picturepanel').css('transform', `scale(${1+imgScale})`);
    // }


    var canvasRect = canvas.getBoundingClientRect();
    var mouse = {
        x: 0,
        y: 0
    };

    function getCoords(e) {
        mouse.x = e.clientX || e.pageX || 0;
        mouse.y = e.clientY || e.pageY || 0;
        mouse.x -= canvasRect.left;
        mouse.y -= canvasRect.top;
        mouse.x = cvSize * 0.5 + (mouse.x - cvSize * 0.5) / scale;
        mouse.y = cvSize * 0.5 + (mouse.y - cvSize * 0.5) / scale;
    }

    function applyStyles(context, styles) {
        for (var style in styles)
            context[style] = styles[style];
    };

    function reDrawHistory() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.save();
        applyStyles(context, styles);
        scaleFromCenter(context, scale);
        for (var i = 0; i < paths.length; i++) {
            context.beginPath();
            context.moveTo(paths[i][0].x, paths[i][0].y);
            for (var j = 1; j < paths[i].length; j++)
                context.lineTo(paths[i][j].x, paths[i][j].y);
            context.stroke();
        }
        context.restore();
    }

    function zoom(context, paths, styles, scale) {

    };

    $("#clear").on("click", function() {
        paths = [];
        currentPathIndex = 0;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });

    $("#zoomIn").on("click", function() {
        scale += scaleStep;
        imgScale += 0.01;
        updatePaintCanvas();

        
    });

    $("#zoomOut").on("click", function() {
        scale -= scaleStep;
        imgScale -= 0.01;
        updatePaintCanvas();
    });

    $("#paintCanvas").on("mousedown", function(e) {
        getCoords(e);
        draw = true;
        context.save();
        applyStyles(context, styles);
        context.beginPath();
        context.moveTo(mouse.x, mouse.y);
        updatePaintCanvas();

        // save the path to memory
        if (typeof paths[currentPathIndex] == 'undefined') paths[currentPathIndex] = [];

        paths[currentPathIndex].push({
            x: mouse.x,
            y: mouse.y
        })

    });

    $("#paintCanvas").on("mousemove", function(e) {
        getCoords(e);
        if (draw) {
            context.lineTo(mouse.x, mouse.y);
            context.stroke();
            updatePaintCanvas();
            paths[currentPathIndex].push({
                x: mouse.x,
                y: mouse.y
            })
        }
    });

    $("#paintCanvas").on("mouseup", function(e) {
        draw = false;
        context.restore();
        currentPathIndex++;
        updatePaintCanvas();
    });


});



window.onload= () =>{
    fetch("http://localhost:3000/getImage").then((e)=>{
        console.log(e.body)
    })
}