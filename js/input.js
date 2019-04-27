var clicks = {leftdown:".",leftup:".",rightdown:".",rightup:".",leftmove:".",rightmove:".",scroll:".", move:false};
var scrollTimer = 0;
var moveTimer = 0;
var mobileClickMode = 0;

if(mobile() == false){
    canvas.onmousedown = function(e){
        clickDown(e.clientX, e.clientY, e.button);
    };

    canvas.onmouseup = function(e){
        clickUp(e.clientX, e.clientY, e.button);
    };

    canvas.onmousemove = function(e){
        clickMove(e.clientX, e.clientY);
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
}
else{
    canvas.ontouchstart = function(e){
        clickDown(e.touches[0].clientX, e.touches[0].clientY, mobileClickMode);
    };

    canvas.ontouchend = function(e){
        clickUp(event.changedTouches[event.changedTouches.length-1].pageX, event.changedTouches[event.changedTouches.length-1].pageY, mobileClickMode);
    };

    canvas.ontouchmove = function(e){
        clickMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    document.getElementById("slider").oninput = function() {
        clicks["scroll"] = {x:canvas.width/2, y:canvas.height/2};
        if(scrollTimer != 0){clearTimeout(scrollTimer);}
        scrollTimer = window.setTimeout("scrollStop()", 250);

        standardRadiusBalls = Number(document.getElementById("slider").value);
    }
}


function clickDown(x,y,mode){
    if(mode == 0){
        clicks["leftdown"] = {x:x, y:y};
        clicks["leftheld"] = true;

        if(clicks["leftdown"].x < standardRadiusBalls){clicks["leftdown"].x = standardRadiusBalls;}
        if(clicks["leftdown"].x > canvas.width - standardRadiusBalls){clicks["leftdown"].x = canvas.width - standardRadiusBalls;}
        if(clicks["leftdown"].y < standardRadiusBalls){clicks["leftdown"].y = standardRadiusBalls;}
        if(clicks["leftdown"].y > canvas.height - standardRadiusBalls){clicks["leftdown"].y = canvas.height - standardRadiusBalls;}

        for (var ball in balls) {
            if (Math.hypot(balls[ball].x - x, balls[ball].y - y) < balls[ball].radius){
                clicks["move"] = ball;
                clicks["moved"] = {x:x, y:y};
                balls[ball].x = x;
                balls[ball].y = y;
                balls[ball].dx = 0;
                balls[ball].dy = 0;
                clicks["leftdown"] = {x:".", y:"."};
            }
        }
    }
    if(mode == 2){
        clicks["rightdown"] = {x:x, y:y};
        clicks["rightheld"] = true;
    }
    if(mode == 1){
        standardRadiusBalls = 30;

        clicks["scroll"] = {x:x, y:y};
        if(scrollTimer != 0){clearTimeout(scrollTimer);}
        scrollTimer = window.setTimeout("scrollStop()", 500);
    }
}

function clickUp(x,y,mode){
    if(mode == 0){
        clicks["leftup"] = {x:x, y:y};
        clicks["leftheld"] = false;

        if(clicks["move"] === false){
            balls[balls.length] = {
                radius:standardRadiusBalls,
                mass:standardRadiusBalls**3,
                dx:-(clicks["leftdown"].x-clicks["leftup"].x)/30, 
                dy:-(clicks["leftdown"].y-clicks["leftup"].y)/30,
                x:clicks["leftdown"].x,
                y:clicks["leftdown"].y,
                color:eval(standardColorBalls),
            };
        }
        else{
            clicks["move"] = false;
            clearTimeout(moveTimer);
        }

        clicks["leftdown"] = {x:".", y:"."};
        clicks["leftmove"] = {x:".", y:"."};
    }
    if(mode == 2){
        clicks["rightup"] = {x:x, y:y};
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
}

function clickMove(x,y){
    if(clicks["leftheld"]){
        clicks["leftmove"] = {x:x, y:y};
    }

    if(clicks["rightheld"]){
        clicks["rightmove"] = {x:x, y:y};
    }

    if(clicks["move"]){
        if(moveTimer != 0){clearTimeout(moveTimer);}
        moveTimer = window.setTimeout("moveStop("+clicks["move"]+")", 10);
        balls[clicks["move"]].x = x;
        balls[clicks["move"]].y = y;
        balls[clicks["move"]].dx = x - clicks["moved"].x;
        balls[clicks["move"]].dy = y - clicks["moved"].y;

        clicks["moved"] = {x:x, y:y};
    }
}

document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == '37'){ //left arrow
        if(paused){
            previousFrame();
        }
    }
    if (e.keyCode == '39'){ //right arrow
        if(paused){
            nextFrame();
        }
    }
    if (e.keyCode == 46){ //delete
        undo();
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
        toggle("collisionBalls");
        toggle("collisionWalls");
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