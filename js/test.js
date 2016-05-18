var selected= 0, isSyncing= false;
var tempTimeInterval, syncTimeInterval, syncTemp;
var pressedKeys= {};

window.onload= function(){
  var canvas= document.getElementById("backcanvas");
  var width= window.innerWidth;
  canvas.style.left= (parseInt(window.innerWidth)/2) + 'px';
  canvas.style.width= (parseInt(window.innerWidth)/2) + 'px';
  document.getElementById("timeline_center").style.left= (parseInt(window.innerWidth)/2) + 'px';
  addField();

  var seekBar = document.getElementById("seek-bar");
  seekBar.addEventListener("change", function(){
    var video= document.getElementById("mainvideo");
    var time= parseDouble(video.currentTime) * (parseDouble(seekBar.value) / 100);
    var timestr= video.currentTime+':'+video.duration;
    var timeline= document.getElementById("backcanvas");
    timeline.style.left= (parseInt(window.innerWidth)/2-time*100)+'px';
    document.getElementById("timetext").innerText= timestr;
    video.currentTime= time;
  });
  var video= document.getElementById("mainvideo");
  video.addEventListener("timeupdate", function(){
    var value= (100/video.duration) * video.currentTime;
    var timestr= video.currentTime+':'+video.duration;
    document.getElementById("timetext").innerText= timestr;
    seekBar.value= value;
  });
  seekBar.style.left= video.style.left;
  seekBar.style.width= video.style.width;
}

function reset(){
  var canvas= document.getElementById("backcanvas");
  var width= window.innerWidth;
  canvas.style.left= (parseInt(window.innerWidth)/2) + 'px';
  document.getElementById("mainvideo").currentTime= 0;
}

function overlayCheck(){
  var container = document.getElementById("backcanvas");
  var last, count= 0;

  for (var i = 0; i < container.childNodes.length; i++) {
    if (container.childNodes[i].nodeName == "div" || container.childNodes[i].nodeName == "DIV") {
      var linepos= parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left);
      var left= parseInt(container.childNodes[i].style.left);
      var width= parseInt(container.childNodes[i].style.width);
      if(linepos >= left && linepos<=(left + width)){
        console.log("overlayed");
        getSubtitleFrame(i, "li");
        return ;
      }
    }
  }
  document.getElementById("subtitle-view").innerText= "";
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
        overlayCheck();
      }, 10);
    }
    else {
      video.pause();
      if(isSyncing == true) setEnd();
      clearInterval(tempTimeInterval);
      return ;
    }
  }
  else if(key == 13) {
    var parent= document.activeElement.parentNode;
    // if(parent.nextElementSibling) parent.nextElementSibling.firstChild.focus();
    // else
    addField();
  }
  else if(key == 38){
    var activeParent= document.activeElement.parentNode;
    if(!video.paused){
      if(isSyncing == true) setEnd();
      activeParent.previousElementSibling.firstChild.focus();
      return ;
    }
    if(activeParent.previousElementSibling){
      var previousActive= activeParent.previousElementSibling.firstChild;
      if(checkBlank() == false) activeParent.previousElementSibling.firstChild.focus();
      else previousActive.focus();
    }
    // document.activeElement.parentNode.previousElementSibling.firstChild.focus();
  } else if(key == 40){
  var activeParent= document.activeElement.parentNode;
    if(!video.paused){
      if(isSyncing == true) setEnd();
      activeParent.nextElementSibling.firstChild.focus();
      return ;
    }
    if(activeParent.nextElementSibling){
      var nextActive= activeParent.nextElementSibling.firstChild;
      if(checkBlank() == false) activeParent.nextElementSibling.firstChild.focus();
      else nextActive.focus();
    }
    // document.activeElement.parentNode.nextElementSibling.firstChild.focus();
  } else if(key == 39){
    if(!video.paused) {
      event.preventDefault();
      if(isSyncing == true) {
        setEnd();
        if(document.activeElement.parentNode.nextElementSibling)
          document.activeElement.parentNode.nextElementSibling.firstChild.focus();
          if(event.altKey)  setStart();
      }
    }
  } else if(key == 37){
    if(!video.paused) {
      event.preventDefault();
      setStart();
    }
  }
  overlayText();
}

function checkBlank(){
  var active= document.activeElement;
  if(active.nodeName == 'input' || active.nodeName == 'INPUT'){
    if(active.value.length < 1) {
      document.getElementById("backcanvas").removeChild(getSubtitleFrame(getSubtitleIndex(), "div"));
      document.getElementById("subtitleul").removeChild(active.parentNode);
      return true;
    }
    return false;
  }
}

function getSubtitleFrame(arg, type) {
  if(type == "div"){
    var ul = document.getElementById("backcanvas");
    var last, count= 0;

    for (var i = 0; i < ul.childNodes.length; i++) {
      if (ul.childNodes[i].nodeName == "div" || ul.childNodes[i].nodeName == "DIV") {
        if(parseInt(i) == parseInt(arg)){
          return ul.childNodes[i];
          // break;
        }
      }
    }
  } else {
    var ul = document.getElementById("subtitleul");
    var count= 0;

    for (var i = 0; i < ul.childNodes.length; i++) {
      if (ul.childNodes[i].nodeName == "li" || ul.childNodes[i].nodeName == "LI") {
        if(parseInt(i) == parseInt(arg)){
          document.getElementById("subtitle-view").innerText= ul.childNodes[i].firstChild.value;
          break;
        }
      }
    }
  }
}

function setStart(){
  isSyncing= true;
  syncTemp = getSubtitleFrame(getSubtitleIndex(), "div");
  var tempLeft= (parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left)) + 'px';
  console.log("left : "+tempLeft);
  syncTemp.style.left= tempLeft;
  syncTemp.style.width= '0px';
  document.activeElement.nextElementSibling.innerText= document.getElementById("mainvideo").currentTime.toFixed(5);

  syncTimeInterval= setInterval(function() {
    syncTemp.style.width= (parseInt(syncTemp.style.width)+2)+'px';
  }, 10);
}

function setEnd(){
  isSyncing= false;
  clearInterval(syncTimeInterval);
  document.activeElement.nextElementSibling.nextElementSibling.innerText= document.getElementById("mainvideo").currentTime.toFixed(5);
}

function addField(){
  var container= document.getElementById("subtitleul");
  var item= document.createElement("li");

  var input= document.createElement("input");
  input.type= "text";
  input.setAttribute("class", "subtitle-text");
  input.setAttribute("onkeydown", "keydownevent(event)");
  item.appendChild(input);

  var timingstart= document.createElement("span");
  timingstart.setAttribute("class", "subtitle-start");
  timingstart.innerText= "start time";
  timingstart.setAttribute("align", "right");
  item.appendChild(timingstart);

  var timingend= document.createElement("span");
  timingend.setAttribute("class", "subtitle-end");
  timingend.innerText= "end time";
  timingend.setAttribute("align", "right");
  item.appendChild(timingend);

  if(countSubtitles() == 0)
    container.appendChild(item);
  else{
    var active= document.activeElement;
    if(active.nodeName == 'INPUT' || active.nodeName == 'input'){
      var activeParent= active.parentNode;
      if(activeParent.nextElementSibling)
        container.insertBefore(item, activeParent.nextElementSibling);
      else container.appendChild(item);
    }
  }
  input.focus();

  var subtitlecontainer= document.getElementById("backcanvas");
  var newsubtitle= document.createElement("div");
  newsubtitle.setAttribute("id", "subtitlesync");
  newsubtitle.style.backgroundColor= "#b3e3be";
  newsubtitle.style.width= "0px";
  subtitlecontainer.appendChild(newsubtitle);
}

function overlayText(){
  document.getElementById("subtitle-view").innerText= checkTextLength(document.activeElement.value);
}
function checkTextLength(str){
  if(str.length <= 40) return str;
  if(str.indexOf(".")>0) return str.substring(0, str.indexOf(".")+1)+"\n"+str.substring(str.indexOf(".")+1);
  if(str.indexOf("!")>0) return str.substring(0, str.indexOf("!")+1)+"\n"+str.substring(str.indexOf("!")+1);
  if(str.indexOf("?")>0) return str.substring(0, str.indexOf("?")+1)+"\n"+str.substring(str.indexOf("?")+1);
  if(str.indexOf(",")>0) return str.substring(0, str.indexOf(",")+1)+"\n"+str.substring(str.indexOf(",")+1);
  for(i=20; i<str.length; i++)
    if(str.indexOf(" ") == i) return str.substring(0, i+1)+"\n"+str.substring(i+1);
}

function countSubtitles() {
  var ul = document.getElementById("subtitleul");
  var liNodes = [];
  var count= 0;
  for (var i = 0; i < ul.childNodes.length; i++)
    if (ul.childNodes[i].nodeName == "LI" || ul.childNodes[i].nodeName == "li") count++;
  return count;
}

function getSubtitleIndex(a){
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
