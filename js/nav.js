function openNav(){
	if(document.getElementById("nav").style.width == "140px"){
		document.getElementById("nav").style.height = "35px";
		document.getElementById("nav").style.width = "35px";
		document.getElementById("settings").style.display = "none";
		document.getElementById("resetIcon").style.display = "none";
	}
	else{
		document.getElementById("nav").style.height = "175px";
		document.getElementById("nav").style.width = "140px";
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
	document.getElementById("speed").value = 100; change("speed");
}