var clicks = {leftdown:".",leftup:".",rightdown:".",rightup:".",leftmove:".",rightmove:".",scroll:".", move:false};
var scrollTimer = 0;
var moveTimer = 0;

canvas.onmousedown = function(e){
    if(e.button == 0){
        clicks["leftdown"] = {x:e.clientX, y:e.clientY};
        clicks["leftheld"] = true;

        if(clicks["leftdown"].x < standardRadiusBalls){clicks["leftdown"].x = standardRadiusBalls;}
        if(clicks["leftdown"].x > canvas.width - standardRadiusBalls){clicks["leftdown"].x = canvas.width - standardRadiusBalls;}
        if(clicks["leftdown"].y < standardRadiusBalls){clicks["leftdown"].y = standardRadiusBalls;}
        if(clicks["leftdown"].y > canvas.height - standardRadiusBalls){clicks["leftdown"].y = canvas.height - standardRadiusBalls;}

        for (var ball in balls) {
            if (Math.hypot(balls[ball].x - clicks["leftdown"].x, balls[ball].y - clicks["leftdown"].y) < balls[ball].radius){
                clicks["move"] = ball;
                clicks["moved"] = {x:e.clientX, y:e.clientY};
                balls[ball].x = clicks["leftdown"].x;
                balls[ball].y = clicks["leftdown"].y;
                balls[ball].dx = 0;
                balls[ball].dy = 0;
                clicks["leftdown"] = {x:".", y:"."};
            }
        }
    }
    if(e.button == 2){
        clicks["rightdown"] = {x:e.clientX, y:e.clientY};
        clicks["rightheld"] = true;
    }
    if(e.button == 1){
        standardRadiusBalls = 30;

        clicks["scroll"] = {x:e.clientX, y:e.clientY};
        if(scrollTimer != 0){clearTimeout(scrollTimer);}
        scrollTimer = window.setTimeout("scrollStop()", 500);
    }
};

canvas.onmouseup = function(e){
    if(e.button == 0){
        clicks["leftup"] = {x:e.clientX, y:e.clientY};
        clicks["leftheld"] = false;

        balls[balls.length] = {
            radius:standardRadiusBalls,
            mass:standardRadiusBalls**3,
            dx:-(clicks["leftdown"].x-clicks["leftup"].x)/30, 
            dy:-(clicks["leftdown"].y-clicks["leftup"].y)/30,
            x:clicks["leftdown"].x,
            y:clicks["leftdown"].y,
            color:eval(standardColorBalls),
        };

        clicks["leftdown"] = {x:".", y:"."};
        clicks["leftmove"] = {x:".", y:"."};
        clicks["move"] = false;
        clearTimeout(moveTimer);
    }
    if(e.button == 2){
        clicks["rightup"] = {x:e.clientX, y:e.clientY};
        clicks["rightheld"] = false;

        walls[walls.length] = {
            x1:clicks["rightdown"].x, 
            y1:clicks["rightdown"].y,
            x2:clicks["rightup"].x,
            y2:clicks["rightup"].y
        };

        clicks["rightdown"] = {x:".", y:"."};
        clicks["rightmove"] = {x:".", y:"."};
    }
};

canvas.onmousemove = function(e){
    if(clicks["leftheld"]){
        clicks["leftmove"] = {x:e.clientX, y:e.clientY};
    }

    if(clicks["rightheld"]){
        clicks["rightmove"] = {x:e.clientX, y:e.clientY};
    }

    if(clicks["move"]){
        if(moveTimer != 0){clearTimeout(moveTimer);}
        moveTimer = window.setTimeout("moveStop("+clicks["move"]+")", 1);
        balls[clicks["move"]].x = e.clientX;
        balls[clicks["move"]].y = e.clientY;
        balls[clicks["move"]].dx = e.clientX - clicks["moved"].x;
        balls[clicks["move"]].dy = e.clientY - clicks["moved"].y;

        clicks["moved"] = {x:e.clientX, y:e.clientY};
    }
};

canvas.onwheel = function(e){
    clicks["scroll"] = {x:e.clientX, y:e.clientY};
    if(scrollTimer != 0){clearTimeout(scrollTimer);}
    scrollTimer = window.setTimeout("scrollStop()", 250);

    if(e.deltaY < 0){
        if(standardRadiusBalls < 99){standardRadiusBalls += 2;}
    }
    if(e.deltaY > 0){
        if(standardRadiusBalls > 11){standardRadiusBalls -= 2;}
    }
};

function moveStop(ball){
    balls[ball].dx = 0;
    balls[ball].dy = 0;
}

function scrollStop(){
    clicks["scroll"] = {x:".", y:"."};
}

var imageCount = 0;
function previewFile(){
    var file = document.querySelector('toggle[type=file]').files[0];
    var reader = new FileReader();

    if(file){
        reader.readAsDataURL(file);
    }
    else{
        standardColorBalls = "randomColor()";
    }

    reader.onloadend = function () {
        imageCount++;
        document.getElementById("images").innerHTML += "<img src='" + reader.result + "' id='img" + imageCount + "' style='display:none;'/>";
        standardColorBalls = "image()";
    }
}

document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == '37'){ //left arrow
        if(paused){
            balls = JSON.parse(JSON.stringify(frameHistory[currentFrame-1]));
            currentFrame--;
            if(trail == false || trailLength){ctx.clearRect(0, 0, canvas.width, canvas.height);}
            drawobjects();
        }
    }
    if (e.keyCode == '39'){ //right arrow
        if(paused){
            if(currentFrame == frameHistory.length || currentFrame == frameHistory.length-1){
                requestAnimationFrame(draw);
            }
            else{
                balls = JSON.parse(JSON.stringify(frameHistory[currentFrame+1]));
                currentFrame++;
                if(trail == false || trailLength){ctx.clearRect(0, 0, canvas.width, canvas.height);}
                drawobjects();
            }
        }
    }

    if (e.keyCode == '72'){ //h
        if(document.getElementById("overlay").style.display == "none"){document.getElementById("overlay").style.display = "block";}
        else{document.getElementById("overlay").style.display = "none";}
    }
    if (e.keyCode == '78'){ //n
        var radius = Math.floor(Math.random() * (100 -9)) + 10;
        balls[balls.length] = {
            radius:radius,
            mass:radius**3,
            dx:Math.floor(Math.random() * (25)) + 1,
            dy:Math.floor(Math.random() * (25)) + 1,
            x:Math.floor(Math.random() * canvas.width),
            y:Math.floor(Math.random() * canvas.width),
            color:eval(standardColorBalls),
        };
    }
    if (e.keyCode == '82'){ //r
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        balls = [];
        walls = [];
    }
    if (e.keyCode == '67'){ //c
        toggle("collision");
    }
    if (e.keyCode == '70'){ //f
        toggle("friction");
    }
    if (e.keyCode == '71'){ //g
        toggle("gravity");
    }
    if (e.keyCode == '80'){ //p
        toggle("paused");
    }
    if (e.keyCode == '84'){ //t
        toggle("trail");
    }
}

function toggle(variable){
    window[variable] = !window[variable];
    document.getElementById(variable + "CB").checked = window[variable];

    if(variable == "paused"){
        if(!paused){requestAnimationFrame(draw);}
    }
}

var basegravityScale = 0.5;
var basefrictionScale = 0.005;
var basespeed = 1;

function change(variable){
    window[variable] = window["base" + variable] * Number(document.getElementById(variable).value)/100;

    if(variable == "trailLength"){
        window[variable] = Number(document.getElementById(variable).value);
    }
}