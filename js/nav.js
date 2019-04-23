function nav(content){
	if(document.getElementById("nav").style.width == "200px" && document.getElementById(content).style.display == "block"){
		closeNav();
	}
	else{
		openNav(content);
	}
}
function openNav(content){
	document.getElementById("nav").style.height = "290px";
	document.getElementById("nav").style.width = "200px";
	//document.getElementById("infoIcon").style.display = "block";

	if(content == "settings"){
		document.getElementById("settings").style.display = "block";
		document.getElementById("resetIcon").style.display = "block";
		document.getElementById("info").style.display = "none";
	}
	if(content == "info"){
		document.getElementById("info").style.display = "block";
		document.getElementById("infoIcon").style.display = "block";
		document.getElementById("settings").style.display = "none";
		document.getElementById("resetIcon").style.display = "none";
	}
}
function closeNav() {
	document.getElementById("nav").style.height = "35px";
	document.getElementById("nav").style.width = "35px";
	document.getElementById("settings").style.display = "none";
	document.getElementById("resetIcon").style.display = "none";
	document.getElementById("info").style.display = "none";
	document.getElementById("infoIcon").style.display = "none";
}

function reset(){
	if(document.getElementById("gravityCB").checked){toggle("gravity");}
	if(!document.getElementById("frictionCB").checked){toggle("friction");}
	if(!document.getElementById("collisionBallsCB").checked){toggle("collisionBalls");}
	if(!document.getElementById("collisionWallsCB").checked){toggle("collisionWalls");}
	if(!document.getElementById("collisionEdgesCB").checked){toggle("collisionEdges");}
	if(document.getElementById("trailCB").checked){toggle("trail");}
	if(document.getElementById("pausedCB").checked){toggle("paused");}
	if(document.getElementById("imageCB").checked){toggle("color", "#");}

	document.getElementById("gravityScale").value = 100; change("gravityScale", "%");
	document.getElementById("frictionScale").value = 100; change("frictionScale", "%");
	document.getElementById("trailLength").value = ""; change("trailLength", "#");
	document.getElementById("speed").value = 100; change("speed", "%");
	document.getElementById("redMin").value = 0; change("redMin", "#");
	document.getElementById("greenMin").value = 0; change("greenMin", "#");
	document.getElementById("blueMin").value = 0; change("blueMin", "#");
	document.getElementById("redMax").value = 250; change("redMax", "#");
	document.getElementById("greenMax").value = 250; change("greenMax", "#");
	document.getElementById("blueMax").value = 250; change("blueMax", "#");
}

function toggle(variable){
	if(variable == "color"){
		if(document.getElementById("imageCB").checked){
			standardColorBalls = "randomColor()";
			document.getElementById("colorCB").checked = !document.getElementById("colorCB").checked;
			document.getElementById("imageCB").checked = !document.getElementById("imageCB").checked;
		}
		else{
			document.getElementById("upload").click();
		}
	}
	else{

    window[variable] = !window[variable];
    document.getElementById(variable + "CB").checked = window[variable];

    if(variable == "paused"){
        if(!paused){requestAnimationFrame(draw);}
    }

	}
}

var basegravityScale = 0.5;
var basefrictionScale = 0.005;
var basespeed = 1;

function change(variable, method){
	if(method == "%"){
    	window[variable] = window["base" + variable] * Number(document.getElementById(variable).value)/100;
    }

    if(method == "#"){
        window[variable] = Number(document.getElementById(variable).value);
    }
}