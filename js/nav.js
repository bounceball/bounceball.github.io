function info() {
    if(document.getElementById("infoTxt").style.display == "block"){
    	closeInfo();
    }
    else{
    	openInfo();
    	closeSettings();
    }
}

function settings() {
    if(document.getElementById("settingsTxt").style.display == "block"){
        closeSettings();
        input();
    }
    else{
    	openSettings();
    	closeInfo();
    }
}

function input(){
	gravityScale = Number(document.getElementById("gravityInput").value)/10;
	airFrictionScale = 1- Number(document.getElementById("airFrictionInput").value)/1000;
	bounceFrictionScale = 1 - Number(document.getElementById("bounceFrictionInput").value)/100;
	speed = Number(document.getElementById("speedInput").value)/100;
}

function openInfo(){
	document.getElementById("infoTxt").style.display = "block";
    document.getElementById("infoIcon").style.opacity = "1";
}

function closeInfo(){
	document.getElementById("infoTxt").style.display = "none";
    document.getElementById("infoIcon").style.opacity = "0.5";
}

function openSettings(){
	document.getElementById("settingsTxt").style.display = "block";
    document.getElementById("settingsIcon").style.opacity = "1";
}

function closeSettings(){
	document.getElementById("settingsTxt").style.display = "none";
    document.getElementById("settingsIcon").style.opacity = "0.5";
}