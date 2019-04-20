var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

document.addEventListener('contextmenu', event => event.preventDefault());

var balls = [];
var walls = [];

var actions = [];

var friction = true;
var gravity = false;
var collision = true;
var paused = false;
var trail = false;
var standardRadiusBalls = 30;
var standardColorBalls = "randomColor()";

var gravityScale = 0.5;
var airFrictionScale = 0.995;
var bounceFrictionScale = 1; //needs rotation to work
var speed = 1;

function draw() {
    if(trail == false){ctx.clearRect(0, 0, canvas.width, canvas.height);}

    if(gravity){applyGravity();}
    if(friction){applyFriction();}
    moveBalls();
    applyCollision();
    drawobjects();

    if(paused==false){requestAnimationFrame(draw);}
}

function applyGravity() {
    for(var ball in balls){
        balls[ball].dy += gravityScale * speed;
    }
}

function applyFriction() {
    for(var ball in balls){
        balls[ball].dx *= airFrictionScale**speed;
        balls[ball].dy *= airFrictionScale**speed;
    }
}

function moveBalls() {
    for(var ball in balls){
        if(ball !== clicks["move"]){
            balls[ball].x += balls[ball].dx * speed;
            balls[ball].y += balls[ball].dy * speed;
        }
    }
}

function applyCollision() {
    if(collision){
        for(var ball1 in balls){
            for (var ball2 in balls) {
                if(ball1 < ball2){
                    if(Math.hypot(balls[ball2].x - balls[ball1].x, balls[ball2].y - balls[ball1].y) < balls[ball1].radius + balls[ball2].radius){
                        var theta1 = Math.atan2(balls[ball1].dy, balls[ball1].dx);
                        var theta2 = Math.atan2(balls[ball2].dy, balls[ball2].dx);
                        var phi = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
                        var m1 = balls[ball1].mass;
                        var m2 = balls[ball2].mass;
                        var v1 = Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
                        var v2 = Math.sqrt(balls[ball2].dx**2 + balls[ball2].dy**2);

                        balls[ball1].dx = ((v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2)) * bounceFrictionScale;
                        balls[ball1].dy = ((v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2)) * bounceFrictionScale;
                        balls[ball2].dx = ((v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2)) * bounceFrictionScale;
                        balls[ball2].dy = ((v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2)) * bounceFrictionScale;

                        var overlap = balls[ball1].radius + balls[ball2].radius - Math.hypot(balls[ball1].x - balls[ball2].x,balls[ball1].y - balls[ball2].y);
                        balls[ball1].x -= overlap * Math.cos(phi)/((balls[ball1].mass/balls[ball2].mass) + 1);
                        balls[ball1].y -= overlap * Math.sin(phi)/((balls[ball1].mass/balls[ball2].mass) + 1);
                        balls[ball2].x += overlap * Math.cos(phi)/((balls[ball2].mass/balls[ball1].mass) + 1);
                        balls[ball2].y += overlap * Math.sin(phi)/((balls[ball2].mass/balls[ball1].mass) + 1);
                    }
                }
            }
        }
    }

    for(var wall1 in walls){
        for (var ball1 in balls){
            for (var i = 0; i <= Math.ceil(Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2)/(balls[ball1].radius*2)); i++) {
                var ball = balls[ball1];
                var wall = walls[wall1];

                if(Math.sqrt(ball.dx**2 + ball.dy**2) !== 0){
                    var balldx = ball.dx/Math.ceil(Math.sqrt(ball.dx**2 + ball.dy**2)/(ball.radius*2))*i;
                    var balldy = ball.dy/Math.ceil(Math.sqrt(ball.dx**2 + ball.dy**2)/(ball.radius*2))*i;
                }
                else{
                    var balldx = 0;
                    var balldy = 0;
                }

                var dx=(ball.x+balldx)-wall.x1;
                var dy=(ball.y+balldy)-wall.y1;

                var dxx=wall.x2-wall.x1;
                var dyy=wall.y2-wall.y1;

                var t=(dx*dxx+dy*dyy)/(dxx*dxx+dyy*dyy);

                var x=wall.x1+dxx*t;
                var y=wall.y1+dyy*t;

                if(t<0){x=wall.x1;y=wall.y1;}
                if(t>1){x=wall.x2;y=wall.y2;}

                if((Math.hypot((ball.x + balldx) - x, (ball.y + balldy) - y) < ball.radius)){
                    var ballAngle = (-Math.atan2(ball.dy, ball.dx)+Math.PI*2)%(Math.PI*2);
                    var wallAngle = ((((-(Math.atan2(y - (ball.y + balldy), x - (ball.x + balldx))))+Math.PI*2)%(Math.PI*2))+Math.PI/2)%(Math.PI*2);
                    var newAngle = 2*wallAngle-ballAngle;
                    var ballspeed = Math.sqrt(ball.dx**2 + ball.dy**2);
                    balls[ball1].dx = Math.cos(newAngle) * ballspeed * bounceFrictionScale;
                    balls[ball1].dy = -Math.sin(newAngle) * ballspeed * bounceFrictionScale;
                }

                if(Math.hypot(ball.x - x, ball.y - y) < ball.radius){
                    var theta = Math.atan2((ball.y - y), (ball.x - x));
                    var overlap = ball.radius - Math.hypot(ball.x - x, ball.y - y);
                    balls[ball1].x += overlap * Math.cos(theta);
                    balls[ball1].y += overlap * Math.sin(theta);
                }
            }
        }
    }

    for(var ball in balls){
        if(balls[ball].x < balls[ball].radius){balls[ball].x = balls[ball].radius; balls[ball].dx *= -bounceFrictionScale; balls[ball].dy *= bounceFrictionScale;}
        if(balls[ball].x > canvas.width - balls[ball].radius){balls[ball].x = canvas.width - balls[ball].radius; balls[ball].dx *= -bounceFrictionScale; balls[ball].dy *= bounceFrictionScale;}
        if(balls[ball].y < balls[ball].radius){balls[ball].y = balls[ball].radius; balls[ball].dy *= -bounceFrictionScale; balls[ball].dx *= bounceFrictionScale;}
        if(balls[ball].y > canvas.height - balls[ball].radius){balls[ball].y = canvas.height - balls[ball].radius; balls[ball].dy *= -bounceFrictionScale; balls[ball].dx *= bounceFrictionScale;}
    }
}    

function drawobjects() {
    for(var ball in balls){
        if(balls[ball].color.indexOf("rgb") == 0){
            ctx.beginPath();
            ctx.arc(balls[ball].x, balls[ball].y, balls[ball].radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.fillStyle = balls[ball].color.slice(0, -1) + ", 0.5)";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = balls[ball].color;
            ctx.stroke();

            ctx.fillStyle = balls[ball].color; 
            ctx.beginPath();
            ctx.moveTo(balls[ball].x,balls[ball].y);
            ctx.lineTo(balls[ball].x+balls[ball].dx,balls[ball].y+balls[ball].dy);
            ctx.lineWidth = 3;
            ctx.strokeStyle = balls[ball].color;
            ctx.stroke();
            
        }
        else{
            ctx.beginPath();
            ctx.arc(balls[ball].x, balls[ball].y, balls[ball].radius, 0, 2*Math.PI);
            ctx.closePath();
            ctx.save();
            ctx.clip();
            ctx.drawImage(document.getElementById(balls[ball].color), balls[ball].x - balls[ball].radius, balls[ball].y - balls[ball].radius,balls[ball].radius*2,balls[ball].radius*2);
            ctx.restore();
        }
    }

    for (var wall in walls) {
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(walls[wall].x1,walls[wall].y1);
        ctx.lineTo(walls[wall].x2,walls[wall].y2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    }

    if(trail==false){
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(clicks["leftdown"].x,clicks["leftdown"].y);
        ctx.lineTo(clicks["leftmove"].x,clicks["leftmove"].y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "Black";
        ctx.stroke();
        var angle = Math.atan2(clicks["leftmove"].y-clicks["leftdown"].y,clicks["leftmove"].x-clicks["leftdown"].x);
        ctx.beginPath();
        ctx.moveTo(clicks["leftmove"].x, clicks["leftmove"].y);
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle-Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle-Math.PI/7));
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle+Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle+Math.PI/7));
        ctx.lineTo(clicks["leftmove"].x, clicks["leftmove"].y);
        ctx.lineTo(clicks["leftmove"].x-1*Math.cos(angle-Math.PI/7),clicks["leftmove"].y-1*Math.sin(angle-Math.PI/7));
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 11;
        ctx.stroke();
        ctx.fillStyle = "Black";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(clicks["scroll"].x,clicks["scroll"].y,standardRadiusBalls,0,Math.PI*2);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "Black"; 
        ctx.beginPath();
        ctx.moveTo(clicks["rightdown"].x,clicks["rightdown"].y);
        ctx.lineTo(clicks["rightmove"].x,clicks["rightmove"].y);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "Black";
        ctx.stroke();
    }
}

var clicks = {leftdown:".",leftup:".",rightdown:".",rightup:".",leftmove:".",rightmove:".",scroll:".", move:false};
var scrollTimer = 0;
var moveTimer = 0;

document.onkeydown = checkKeyDown;

function checkKeyDown(e) {

    e = e || window.event;
    
    if (e.keyCode == '8'){ //backspace
        if(document.getElementById("settingsTxt").style.display !== "block"){
            if(actions[actions.length-1] == "ball"){balls.pop(); actions.pop();}
            else if(actions[actions.length-1] == "wall"){walls.pop(); actions.pop();}
        }
    }
    if (e.keyCode == '39'){ //right arrow
        if(paused){requestAnimationFrame(draw);}
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
            color: eval(standardColorBalls),
        };
        actions.push("ball");
    }
    if (e.keyCode == '82'){ //r
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        balls = [];
        walls = [];
        
    }
    if (e.keyCode == '67'){ //c
        collision = !collision;
        if(collision){document.getElementById("collision").innerHTML = "On";}
        else{document.getElementById("collision").innerHTML = "Off";}
    }
    if (e.keyCode == '70'){ //f
        friction = !friction;
        if(friction){document.getElementById("friction").innerHTML = "On";}
        else{document.getElementById("friction").innerHTML = "Off";}
    }
    if (e.keyCode == '71'){ //g
        gravity = !gravity;
        if(gravity){document.getElementById("gravity").innerHTML = "On";}
        else{document.getElementById("gravity").innerHTML = "Off";}
    }
    if (e.keyCode == '80'){ //p
        paused = !paused;
        requestAnimationFrame(draw);
        if(paused){document.getElementById("pause").innerHTML = "Paused";}
        else{document.getElementById("pause").innerHTML = "Not Paused";}
    }
    if (e.keyCode == '84'){ //t
        trail = !trail;
        if(trail){document.getElementById("trail").innerHTML = "On";}
        else{document.getElementById("trail").innerHTML = "Off";}
    }
}

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
            color: eval(standardColorBalls),
        };
        actions.push("ball");

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
        actions.push("wall");

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
    var file = document.querySelector('input[type=file]').files[0];
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

function randomColor(){return "rgb(" + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ", " + Math.floor(Math.random() * 250) + ")";}
function image(){return "img" + imageCount;}

draw();