var selected= 0, isSyncing= false;
var tempTimeInterval, syncTimeInterval, syncTemp;
var pressedKeys= {};
var dummytext= ["안녕하세요", "이거슨", "더미데이터를 위한", "테스트 텍스트입니다", "뾰로롱"];
var dummystart= [0.3824, 5.9019, 7.5526, 9.6273, 13.133];
var dummyend= [1.5991, 7.5511, 9.6259, 11.411, 13.670];

window.onload= function(){
  var canvas= document.getElementById("backcanvas");
  var width= window.innerWidth;
  canvas.style.left= (strToNum(window.innerWidth, "int")/2) + 'px';
  canvas.style.width= (strToNum(window.innerWidth, "int")/2) + 'px';
  document.getElementById("timeline_center").style.left= (strToNum(window.innerWidth, "int")/2) + 'px';
  loadOriginal();

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

function loadOriginal(){
  var origcontainer= document.getElementById("subtitleoriginalul");
  var translatecontainer= document.getElementById("subtitletranslateul");

  for(i=0; i<dummytext.length; i++){
    var item= document.createElement("li");
    var transitem= document.createElement("li");

    var originput= document.createElement("input");
    originput.type= "text";
    originput.setAttribute("class", "subtitle-text");
    originput.setAttribute("onkeydown", "keydownevent(event)");
    originput.value= dummytext[i];
    item.appendChild(originput);

    var transinput= document.createElement("input");
    transinput.type= "text";
    transinput.setAttribute("class", "subtitle-text");
    transinput.setAttribute("onkeydown", "keydownevent(event)");
    transitem.appendChild(transinput);

    var timingstart= document.createElement("span");
    timingstart.setAttribute("class", "subtitle-start");
    timingstart.innerText= dummystart[i];
    timingstart.setAttribute("align", "right");
    item.appendChild(timingstart);

    var transtimingstart= document.createElement("span");
    transtimingstart.setAttribute("class", "subtitle-start");
    transtimingstart.innerText= dummystart[i];
    transtimingstart.setAttribute("align", "right");
    transitem.appendChild(transtimingstart);

    var timingend= document.createElement("span");
    timingend.setAttribute("class", "subtitle-end");
    timingend.innerText= dummyend[i];
    timingend.setAttribute("align", "right");
    item.appendChild(timingend);

    var transtimingend= document.createElement("span");
    transtimingend.setAttribute("class", "subtitle-end");
    transtimingend.innerText= dummyend[i];
    transtimingend.setAttribute("align", "right");
    transitem.appendChild(transtimingend);

    origcontainer.appendChild(item);
    translatecontainer.appendChild(transitem);

    var subtitlecontainer= document.getElementById("backcanvas");
    var newsubtitle= document.createElement("div");
    newsubtitle.setAttribute("id", "subtitlesync");
    newsubtitle.style.backgroundColor= "#b3e3be";
    newsubtitle.style.width= (parseFloat(dummyend[i]) - parseFloat(dummystart[i]))*100*2 + 'px';
    // newsubtitle.style.left= (parseInt(document.getElementById("timeline_center").style.left) - parseFloat(dummystart[i])*100*2) + 'px';
    newsubtitle.style.left= (parseFloat(dummystart[i])*100*2) + 'px';
    // (parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left)) + 'px';
    subtitlecontainer.appendChild(newsubtitle);

    // syncTemp = getSubtitleFrame(getSubtitleIndex(), "div");
    // var tempLeft= (parseInt(document.getElementById("timeline_center").style.left) - parseInt(document.getElementById("backcanvas").style.left)) + 'px';
    // console.log("left : "+tempLeft);
    // syncTemp.style.left= tempLeft;
    // syncTemp.style.width= '0px';
  }
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
      // video.currentTime : type : double
      video.currentTime= strToNum(document.activeElement.nextElementSibling.innerText, "double");
      // add timeline moving
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
      document.getElementById("subtitletranslateul").removeChild(active.parentNode);
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
    var ul = document.getElementById("subtitletranslateul");
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
  document.activeElement.nextElementSibling.innerText= document.getElementById("mainvideo").currentTime.toPrecision(4);

  syncTimeInterval= setInterval(function() {
    syncTemp.style.width= (parseInt(syncTemp.style.width)+2)+'px';
  }, 10);
}

function setEnd(){
  isSyncing= false;
  clearInterval(syncTimeInterval);
  document.activeElement.nextElementSibling.nextElementSibling.innerText= document.getElementById("mainvideo").currentTime.toPrecision(4);
}

function addField(){
  var container= document.getElementById("subtitletranslateul");
  var item= document.createElement("li");

  var input= document.createElement("input");
  input.type= "text";
  input.setAttribute("class", "subtitle-text");
  input.setAttribute("onkeydown", "keydownevent(event)");
  item.appendChild(input);
  var timingstart= document.createElement("span");
  timingstart.setAttribute("class", "subtitle-start");
  timingstart.setAttribute("align", "right");
  item.appendChild(timingstart);
  var timingend= document.createElement("span");
  timingend.setAttribute("class", "subtitle-end");
  timingend.setAttribute("align", "right");
  item.appendChild(timingend);
  timingstart.innerText= "0.0000";
  timingend.innerText= "0.0000";
  var subtitlecontainer= document.getElementById("backcanvas");
  var newsubtitle= document.createElement("div");
  newsubtitle.setAttribute("id", "subtitlesync");
  newsubtitle.style.backgroundColor= "#b3e3be";
  subtitlecontainer.appendChild(newsubtitle);

  if(countSubtitles() == 0){
      container.appendChild(item);
      timingstart.innerText= "0.0000";
      timingend.innerText= "0.0000";
      newsubtitle.style.width= "0px";
  }
  else{
    var active= document.activeElement;
    if(active.nodeName == "INPUT" || active.nodeName == "input"){
      var activeParent= active.parentNode;
      var aprime= strToNum(active.nextElementSibling.nextElementSibling.innerText, "double");
      var b= strToNum(activeParent.nextElementSibling.firstChild.nextElementSibling.innerText, "double");

      var divA= getSubtitleFrame(getSubtitleIndex(), "div");
      var divB= getSubtitleFrame(getSubtitleIndex()+1, "div");

      if(b-aprime < 0.5){
        var a= strToNum(active.nextElementSibling.innerText, "double");
        var bprime= strToNum(activeParent.nextElementSibling.firstChild.nextElementSibling.nextElementSibling.innerText, "double");
        var term= ((bprime-a)/3).toPrecision(5);
        var termWidth= (strToNum(divB.style.left, "int") + strToNum(divB.style.width, "int") - strToNum(divA.style.left, "int") - strToNum(divA.style.width, "int")) / 3;

        active.nextElementSibling.nextElementSibling.innerText= strToNum(a, "double")+strToNum(term, "double");
        active.nextElementSibling.nextElementSibling.innerText= strToNum(active.nextElementSibling.nextElementSibling.innerText, "double").toPrecision(5);
        activeParent.nextElementSibling.firstChild.nextElementSibling.innerText= strToNum(a, "double")+strToNum(term, "double")*2;
        activeParent.nextElementSibling.firstChild.nextElementSibling.innerText= strToNum(activeParent.nextElementSibling.firstChild.nextElementSibling.innerText, "double").toPrecision(5);
        timingstart.innerText= strToNum(a, "double")+strToNum(term, "double");
        timingstart.innerText= strToNum(timingstart.innerText, "double").toPrecision(5);
        timingend.innerText= strToNum(a, "double")+strToNum(term, "double")*2;
        timingend.innerText= strToNum(timingend.innerText, "double").toPrecision(5);

        divA.style.width= strToNum(termWidth, "int");
        divB.style.width= strToNum(termWidth, "int");
        newsubtitle.style.left= (strToNum(divA.style.left, "int")+strToNum(termWidth, "int")) + "px";
        newsubtitle.style.width= strToNum(termWidth, "int");
        divB.style.left= (strToNum(divA.style.left, "int")+strToNum(termWidth, "int")*2) + "px";
      } else {
        timingstart.innerText= (strToNum(aprime, "double")).toPrecision(5);
        timingend.innerText= (strToNum(b, "double")).toPrecision(5);
        newsubtitle.style.left= (strToNum(divA.style.left, "int") + strToNum(divA.style.width, "int")) + "px";
        newsubtitle.style.width= (strToNum(divB.style.left, "int") - strToNum(newsubtitle.style.left, "int")) + "px";
      }
      if(activeParent.nextElementSibling) container.insertBefore(item, activeParent.nextElementSibling);
      else container.appendChild(item);
    }
  }
  input.focus();
}

function overlayText(){ document.getElementById("subtitle-view").innerText= checkTextLength(document.activeElement.value); }
function checkTextLength(str){
  if(str.length <= 40) return str;
  if(str.indexOf("(")>0) return str.substring(0, str.indexOf("(")+1)+"\n"+str.substring(str.indexOf("(")+1);
  if(str.indexOf(".")>0) return str.substring(0, str.indexOf(".")+1)+"\n"+str.substring(str.indexOf(".")+1);
  if(str.indexOf("!")>0) return str.substring(0, str.indexOf("!")+1)+"\n"+str.substring(str.indexOf("!")+1);
  if(str.indexOf("?")>0) return str.substring(0, str.indexOf("?")+1)+"\n"+str.substring(str.indexOf("?")+1);
  if(str.indexOf(",")>0) return str.substring(0, str.indexOf(",")+1)+"\n"+str.substring(str.indexOf(",")+1);
  for(i=20; i<str.length; i++) if(str.indexOf(" ") == i) return str.substring(0, i+1)+"\n"+str.substring(i+1);
}

function countSubtitles() {
  var ul = document.getElementById("subtitletranslateul");
  var liNodes = [];
  var count= 0;
  for (var i = 0; i < ul.childNodes.length; i++) if (ul.childNodes[i].nodeName == "LI" || ul.childNodes[i].nodeName == "li") count++;
  return count;
}

function getSubtitleIndex(a){
  var ul = document.getElementById("subtitletranslateul");
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

 // function getDivFromSubtitle(a){
 //   var ul = document.getElementById("subtitletranslateul");
 //   var count= 0;
 //
 //   for (var i = 0; i < ul.childNodes.length; i++) {
 //     if (ul.childNodes[i].nodeName == "LI" || ul.childNodes[i].nodeName == "li") {
 //       if(ul.childNodes[i].firstChild === document.activeElement) break;
 //       count++;
 //     }
 //   }
 //   console.log(count);
 //
 //   return count;
 // }


function strToNum(str, type){ return (type == "double" ? parseFloat(str) : (type == "int" ? parseInt(str) : "")); }
