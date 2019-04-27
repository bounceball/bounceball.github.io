var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("width", window.innerWidth);
canvas.setAttribute("height", window.innerHeight);

document.addEventListener("contextmenu", event => event.preventDefault());

var balls = [];
var walls = [];

var friction = true;
var gravity = false;
var collisionBalls = true;
var collisionWalls = true;
var collisionEdges = true;
var wrapEdges = false;
var paused = false;
var trail = false;
var standardRadiusBalls = 30;
var standardColorBalls = "randomColor()";

var gravityScale = 0.5;
var frictionScale = 0.005;
var speed = 1;
var trailLength;

var frameHistory = [];
var currentFrame = 0;

function draw() {
    frameHistory[currentFrame] = {balls: JSON.parse(JSON.stringify(balls)), walls: JSON.parse(JSON.stringify(walls))};
    currentFrame++;

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
        balls[ball].dx *= (1-frictionScale)**speed;
        balls[ball].dy *= (1-frictionScale)**speed;
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
    if(collisionBalls){
        for(var ball1 in balls){
            for (var ball2 in balls) {
                if(ball1 < ball2){
                    if(Math.hypot(balls[ball2].x - balls[ball1].x, balls[ball2].y - balls[ball1].y) <= balls[ball1].radius + balls[ball2].radius){
                        if(clicks["move"] !== ball1 && clicks["move"] !== ball2){
                            if((Math.hypot(balls[ball2].x - balls[ball2].dx) - (balls[ball1].x - balls[ball1].dx), (balls[ball2].y - balls[ball2].dy) - (balls[ball1].y - balls[ball1].dy)) > balls[ball1].radius + balls[ball2].radius){
                                for(var t = 0; t<1; t+=0.1){
                                    if(Math.hypot((balls[ball2].x - t*balls[ball2].dx) - (balls[ball1].x - t*balls[ball1].dx), (balls[ball2].y - t*balls[ball2].dy) - (balls[ball1].y - t*balls[ball1].dy))>balls[ball1].radius + balls[ball2].radius){
                                        balls[ball1].x -= balls[ball1].dx*t;
                                        balls[ball1].y -= balls[ball1].dy*t;
                                        balls[ball2].x -= balls[ball2].dx*t;
                                        balls[ball2].y -= balls[ball2].dy*t;
                                        t=1;
                                    }
                                }
                            }
                            else{
                                var theta = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
                                var overlap = balls[ball1].radius + balls[ball2].radius - Math.hypot(balls[ball1].x - balls[ball2].x, balls[ball1].y - balls[ball2].y);
                                balls[ball1].x -= overlap * Math.cos(theta)/((balls[ball1].mass/balls[ball2].mass) + 1);
                                balls[ball1].y -= overlap * Math.sin(theta)/((balls[ball1].mass/balls[ball2].mass) + 1);
                                balls[ball2].x += overlap * Math.cos(theta)/((balls[ball2].mass/balls[ball1].mass) + 1);
                                balls[ball2].y += overlap * Math.sin(theta)/((balls[ball2].mass/balls[ball1].mass) + 1);
                            }

                            var theta1 = Math.atan2(balls[ball1].dy, balls[ball1].dx);
                            var theta2 = Math.atan2(balls[ball2].dy, balls[ball2].dx);
                            var phi = Math.atan2(balls[ball2].y - balls[ball1].y, balls[ball2].x - balls[ball1].x);
                            var m1 = balls[ball1].mass;
                            var m2 = balls[ball2].mass;
                            var v1 = Math.sqrt(balls[ball1].dx**2 + balls[ball1].dy**2);
                            var v2 = Math.sqrt(balls[ball2].dx**2 + balls[ball2].dy**2);

                            balls[ball1].dx = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                            balls[ball1].dy = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                            balls[ball2].dx = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                            balls[ball2].dy = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);
                        }
                        else{
                            var ball = (clicks["move"] == ball2) ? ball1 : ball2;

                            var theta = Math.atan2(balls[clicks["move"]].y - balls[ball].y, balls[clicks["move"]].x - balls[ball].x);
                            var overlap = balls[ball].radius + balls[clicks["move"]].radius - Math.hypot(balls[ball].x - balls[clicks["move"]].x, balls[ball].y - balls[clicks["move"]].y);
                            balls[ball].x -= overlap * Math.cos(theta);
                            balls[ball].y -= overlap * Math.sin(theta);

                            var theta1 = Math.atan2(balls[ball].dy, balls[ball].dx);
                            var phi = Math.atan2(balls[clicks["move"]].y - balls[ball].y, balls[clicks["move"]].x - balls[ball].x);
                            var v1 = Math.sqrt(balls[ball].dx**2 + balls[ball].dy**2);

                            balls[ball].dx = (-v1 * Math.cos(theta1 - phi)) * Math.cos(phi) + v1*Math.sin(theta-phi) * Math.cos(phi+Math.PI/2);
                            balls[ball].dy = (-v1 * Math.cos(theta1 - phi)) * Math.sin(phi) + v1*Math.sin(theta-phi) * Math.sin(phi+Math.PI/2);
                        }
                    }
                }
            }
        }
    }

    if(collisionWalls){
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
                        balls[ball1].dx = Math.cos(newAngle) * ballspeed;
                        balls[ball1].dy = -Math.sin(newAngle) * ballspeed;
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
    }

    if(collisionEdges){
        for(var ball in balls){
            if(balls[ball].x < balls[ball].radius){balls[ball].x = balls[ball].radius; balls[ball].dx *= -1;}
            if(balls[ball].x > canvas.width - balls[ball].radius){balls[ball].x = canvas.width - balls[ball].radius; balls[ball].dx *= -1;}
            if(balls[ball].y < balls[ball].radius){balls[ball].y = balls[ball].radius; balls[ball].dy *= -1;}
            if(balls[ball].y > canvas.height - balls[ball].radius){balls[ball].y = canvas.height - balls[ball].radius; balls[ball].dy *= -1;}
        }
    }
    else if(wrapEdges){
        for(var ball in balls){
            if(balls[ball].x < -balls[ball].radius){balls[ball].x = canvas.width+balls[ball].radius;}
            if(balls[ball].x > canvas.width+balls[ball].radius){balls[ball].x = -balls[ball].radius;}
            if(balls[ball].y < -balls[ball].radius){balls[ball].y = canvas.height+balls[ball].radius;}
            if(balls[ball].y > canvas.height+balls[ball].radius){balls[ball].y = -balls[ball].radius;}
        }
    }
    else{
        for(var ball in balls){
            if(balls[ball].x < -balls[ball].radius){balls.splice(ball,1); if(clicks["move"]>=ball&&clicks["move"]){clicks["move"]-=1;}; ball-=1; continue;}
            if(balls[ball].x > canvas.width+balls[ball].radius){balls.splice(ball,1); if(clicks["move"]>=ball&&clicks["move"]){clicks["move"]-=1;}; ball-=1; continue;}
            if(balls[ball].y < -balls[ball].radius){balls.splice(ball,1); if(clicks["move"]>=ball&&clicks["move"]){clicks["move"]-=1;}; ball-=1; continue;}
            if(balls[ball].y > canvas.height+balls[ball].radius){balls.splice(ball,1); if(clicks["move"]>=ball&&clicks["move"]){clicks["move"]-=1;}; ball-=1; continue;}
        }
    }
}    

function drawobjects() {
    if(trail == false || trailLength){ctx.clearRect(0, 0, canvas.width, canvas.height);}
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

    if(trailLength && trail){
        for(var frame = currentFrame-trailLength; frame<currentFrame; frame++){
            for(var ball in frameHistory[frame].balls){
                if(frameHistory[frame].balls[ball].color.indexOf("rgb") == 0){
                    ctx.beginPath();
                    ctx.arc(frameHistory[frame].balls[ball].x, frameHistory[frame].balls[ball].y, frameHistory[frame].balls[ball].radius, 0, 2*Math.PI);
                    ctx.closePath();
                    ctx.fillStyle = frameHistory[frame].balls[ball].color.slice(0, -1) + ", " + (frame-currentFrame+trailLength)/(trailLength*2) + ")";
                    ctx.fill();
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = frameHistory[frame].balls[ball].color.slice(0, -1) + ", " + (frame-currentFrame+trailLength)/(trailLength) + ")";
                    ctx.stroke();
                }
                else{
                    ctx.beginPath();
                    ctx.arc(frameHistory[frame].balls[ball].x, frameHistory[frame].balls[ball].y, frameHistory[frame].balls[ball].radius, 0, 2*Math.PI);
                    ctx.closePath();
                    ctx.save();
                    ctx.clip();
                    ctx.drawImage(document.getElementById(frameHistory[frame].balls[ball].color), frameHistory[frame].balls[ball].x - frameHistory[frame].balls[ball].radius, frameHistory[frame].balls[ball].y - frameHistory[frame].balls[ball].radius,frameHistory[frame].balls[ball].radius*2,frameHistory[frame].balls[ball].radius*2);
                    ctx.restore();
                }
            }
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

    if(trail == false || trailLength){
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

draw();