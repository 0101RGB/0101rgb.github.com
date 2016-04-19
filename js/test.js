var selected= 0;
var tempTimeInterval;
var syncTimeInterval;
var syncTemp;
var isSyncing= false;

window.onload= function(){
  var canvas= document.getElementById("backcanvas");
  var width= window.innerWidth;
  canvas.style.left= (parseInt(window.innerWidth)/2) + 'px';
  canvas.style.width= (parseInt(window.innerWidth)/2) + 'px';
  document.getElementById("timeline_center").style.left= (parseInt(window.innerWidth)/2) + 'px';
  addField();
}

function reset(){
  var canvas= document.getElementById("backcanvas");
  var width= window.innerWidth;

  canvas.style.left= (parseInt(window.innerWidth)/2) + 'px';
}

function keydownevent(event) {
  var video= document.getElementById("mainvideo");
  var key = event.which || event.keyCode;
  if(key == 9) {
    event.preventDefault();
    if(video.paused) {
      video.play();
      tempTimeInterval= setInterval(function() {
        var canvasId= document.getElementById("backcanvas");
        var canvasLeft= parseInt(canvasId.style.left, 10);
        canvasId.style.left= (canvasLeft-2)+'px';
        canvasId.style.width= (parseInt(canvasId.style.width)+2)+'px';

        var line= parseInt(window.innerWidth)/2;
        // var checkOverlay= 
      }, 10);
    }
    else {
      video.pause();
      if(isSyncing == true) setEnd();
      clearInterval(tempTimeInterval);
    }
  }
  else if(key == 13) {
    var parent= document.activeElement.parentNode;
    if(parent.nextElementSibling) parent.nextElementSibling.firstChild.focus();
    else addField();
  }
  else if(key == 38){
    if(!video.paused){
      if(isSyncing == true) setEnd();
    }
    document.activeElement.parentNode.previousElementSibling.firstChild.focus();
  } else if(key == 40){
    if(!video.paused){
      if(isSyncing == true) setEnd();
    }
    document.activeElement.parentNode.nextElementSibling.firstChild.focus();
  } else if(key == 39){
    if(!video.paused) {
      if(isSyncing == true) {
        console.log("syncing ing");
        setEnd();
      }
    }
    // countSubtitles();
  } else if(key == 37){
    if(!video.paused) {
      setStart();
    }
    // countSubtitles();
  }
  overlayText();
}

function getSubtitleFrame(arg) {
  var ul = document.getElementById("backcanvas");
  var last, count= 0;

  for (var i = 0; i < ul.childNodes.length; i++) {
    if (ul.childNodes[i].nodeName == "div" || ul.childNodes[i].nodeName == "DIV") {
      // count++;
      // last= ul.childNodes[i];
      if(parseInt(i) == parseInt(arg)){
        // return ul.childNodes[i];
        syncTemp= ul.childNodes[i];
        break;
      }
    }
  }
}

function setStart(){
  isSyncing= true;
  getSubtitleFrame(getSubtitleIndex());

  // var tempLeft= (parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left)) + 'px';
  var tempLeft= (parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left)) + 'px';
  console.log("left : "+tempLeft);
  syncTemp.style.left= tempLeft;
  syncTemp.style.width= '0px';

  syncTimeInterval= setInterval(function() {
    syncTemp.style.width= (parseInt(syncTemp.style.width)+2)+'px';
    // syncTemp.style.left= (parseInt(syncTemp.style.left)-2)+'px';
    // console.log(syncTemp.style.left);
  }, 10);
}

function setEnd(){
  isSyncing= false;
  clearInterval(syncTimeInterval);
}

function addField(){
  var container= document.getElementById("subtitleul");
  var item= document.createElement("li");
  var input= document.createElement("input");
  input.type= "text";
  input.setAttribute("class", "subtitle-text");
  input.setAttribute("onkeydown", "keydownevent(event)");
  item.appendChild(input);
  var timing= document.createElement("span");
  timing.setAttribute("class", "subtitle-timing");
  timing.innerText= document.getElementById("mainvideo").currentTime;
  timing.setAttribute("align", "right");
  item.appendChild(timing);
  item.setAttribute("id", "subtitle");

  container.appendChild(item);
  input.focus();

  var subtitlecontainer= document.getElementById("backcanvas");
  var newsubtitle= document.createElement("div");
  newsubtitle.setAttribute("id", "subtitlesync");
  newsubtitle.style.backgroundColor= "#b3e3be";
  newsubtitle.style.width= "0px";
  subtitlecontainer.appendChild(newsubtitle);
}

function overlayText(){
  var text= document.activeElement;
  document.getElementById("subtitle-view").innerText= text.value;
}

function countSubtitles() {
  var ul = document.getElementById("subtitleul");
  var liNodes = [];
  var count= 0;

  for (var i = 0; i < ul.childNodes.length; i++) {
    if (ul.childNodes[i].nodeName == "LI" || ul.childNodes[i].nodeName == "li") {
      // liNodes.push(ul.childNodes[i]);
      count++;
    }
  }
  // alert(count);
  console.log(count);
  return count;
}

function getSubtitleIndex(){
  var ul = document.getElementById("subtitleul");
  var count= 0;

  for (var i = 0; i < ul.childNodes.length; i++) {
    if (ul.childNodes[i].nodeName == "LI" || ul.childNodes[i].nodeName == "li") {
      if(ul.childNodes[i].firstChild === document.activeElement) return count;
      count++;
    }
  }
  console.log(count);
  return count;
}

function downloadClick(){
  var str= "";
  var ulele= document.getElementById("subtitleul");
  for(var e in ulele){
    str = str + " :: " + e.firstChild.value+":" + e.firstChild.nextSibling.innerText;
  }
}
