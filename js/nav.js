function openNav(){
	if(document.getElementById("nav").style.width == "150px"){
		document.getElementById("nav").style.height = "35px";
		document.getElementById("nav").style.width = "35px";
		document.getElementById("settings").style.display = "none";
		document.getElementById("resetIcon").style.display = "none";
	}
	else{
		document.getElementById("nav").style.height = "175px";
		document.getElementById("nav").style.width = "150px";
		document.getElementById("settings").style.display = "block";
		document.getElementById("resetIcon").style.display = "block";
	}
}

function reset(){
	if(document.getElementById("gravityCB").checked){toggle("gravity");}
	if(!document.getElementById("frictionCB").checked){toggle("friction");}
	if(!document.getElementById("collisionCB").checked){toggle("collision");}
	if(document.getElementById("trailCB").checked){toggle("trail");}
	if(document.getElementById("pausedCB").checked){toggle("paused");}

	document.getElementById("gravityScale").value = 100; change("gravityScale");
	document.getElementById("frictionScale").value = 100; change("frictionScale");
	document.getElementById("trailLength").value = ""; change("trailLength");
	document.getElementById("speed").value = 100; change("speed");
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