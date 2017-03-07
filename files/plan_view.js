/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : plan_view.js
*! REVISION   : 1.0
*! DESCRIPTION: Handles drawing, rmoving/resizing and capturing mouse events
*!              for the plan view
*! Copyright (C) 2011 Elphel, Inc.
*!
*! -----------------------------------------------------------------------------**
*!  This program is free software: you can redistribute it and/or modify
*!  it under the terms of the GNU General Public License as published by
*!  the Free Software Foundation, either version 3 of the License, or
*!  (at your option) any later version.
*!
*!  This program is distributed in the hope that it will be useful,
*!  but WITHOUT ANY WARRANTY; without even the implied warranty of
*!  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*!  GNU General Public License for more details.
*!
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*!
*!  It means that the program's users have the four essential freedoms:
*!
*!   * The freedom to run the program, for any purpose (freedom 0).
*!   * The freedom to study how the program works, and change it to make it do what you wish (freedom 1). 
*!     Access to the source code is a precondition for this.
*!   * The freedom to redistribute copies so you can help your neighbor (freedom 2).
*!   * The freedom to distribute copies of your modified versions to others (freedom 3). 
*!
*!  By doing this you can give the whole community a chance to benefit from your changes. 
*!  Access to the source code is a precondition for this. 
*! -----------------------------------------------------------------------------**
*/

//var fovYMaxPlan=fovYMax; // adjust separately? fovY when plan is the 2*settings.range x 2*settings.range square
var fovYMaxPlan; // adjust separately? fovY when plan is the 2*settings.range x 2*settings.range square
var mouseDownPlan=false;
var mouseDownPlanMove=false; // valid only with mouseDownPlan
var mouseDownPlanResize=false; // valid only with mouseDownPlan
function handlePlanMouseDown(event,which,visibility){ // -2 - none, -1 - selected, 0 - center, >0 - arrow+1
//    lastMouseX = this.event.clientX; //
//    lastMouseY = this.event.clientY;
    if ((which!=-2) && !visibility && !event.shiftKey && !event.ctrlKey) return; // invisible cameras are only dragged with SHIFT or CNTRL

    lastMouseX = event.clientX; //
    lastMouseY = event.clientY;
//document.title=event.clientX+":"+event.clientY;
    var size= parseInt(document.getElementById("idPlanView").style.width);
    var top= parseInt(document.getElementById("idPlanView").style.top);
    var left= parseInt(document.getElementById("idPlanView").style.left);
    mouseDownPlanMove=false; // valid only with mouseDownPlan
    mouseDownPlanResize=false; // valid only with mouseDownPlan
    var moveHot=0.1*size;
//    document.title=which;
    if (which<-1) {
      if (((lastMouseX-left)<moveHot) && ((lastMouseY-top)<moveHot)) {
         mouseDownPlanMove=true;
//        document.title+="++move";
      } else if (((lastMouseX-left)>=(size-moveHot)) && ((lastMouseY-top)>=(size-moveHot))) {
         mouseDownPlanResize=true;
//         document.title+="++resize";
      } else {
//         document.title+="++inside";
// close to a dot?
      }
    } else  {
//         document.title=which;
// alert ("dot number "+which);
      currentArrow=which;
//      handleMouseDown(this.event);
      handleMouseDown(event);
      mouseDown=false; // will not drag webgl view
    }
//alert ("lastMouseX="+lastMouseX+"\nlastMouseY="+lastMouseY);
    mouseDownPlan=true;
}
function handlePlanMouseMove(event) { // returns true if processed here, false - continue other mousemove
  if (mouseDown) return false ; // does not belong here

//  document.title="mouseDownPlanMove="+mouseDownPlanMove+" mouseDownPlanResize="+mouseDownPlanResize;

  var size= parseInt(document.getElementById("idPlanView").style.width);
  var top= parseInt(document.getElementById("idPlanView").style.top);
  var left= parseInt(document.getElementById("idPlanView").style.left);
  var moveHot=0.1*size;
  var newX = event.clientX;
  var newY = event.clientY;
  if (mouseDownPlan) {
    if       (mouseDownPlanMove) {
//      document.title+="--move";
       movePlanView  (newX-lastMouseX,newY-lastMouseY);
    } else if  (mouseDownPlanResize) {
//      document.title+="--resize";
        resizePlanView(newX-lastMouseX,newY-lastMouseY);
    } else {
//TODO: move camera
//         document.title="--inside";
      if (floatingEyesisNum>=0) { // move selected camera, no matter where clicked
         var dx=(newX-lastMouseX)/(size/2)*settings.range/fovYMaxPlan*fovY; // in meters, positive in view azimuth+90
         var dy=(newY-lastMouseY)/(size/2)*settings.range/fovYMaxPlan*fovY; // in meters, positive in view azimuth+1807334
         var a=Math.PI/180*(azimuth);
         var sina=Math.sin(a);
         var cosa=Math.cos(a);
         var dNorth=-dx*sina-dy*cosa;
         var dEast=  dx*cosa-dy*sina;
         var targeta=Math.PI/180*(-floatingEyesis.angle);
         var dist= Math.abs(floatingEyesis.distance);
         var north=dist*Math.cos(targeta);
         var east=dist*Math.sin(targeta);
//document.title="f0="+floatingEyesis.angle+" f2="+floatingEyesis.distance;
//document.title+="dx="+Math.round(dx*1000)/1000+" dy="+Math.round(dy*1000)/1000+" n="+Math.round(north*1000)/1000+" e="+Math.round(east*1000)/1000+" ta="+Math.round(targeta*10)/10+" d="+Math.round(dist*1000)/1000;
         north+=dNorth;
         east+=dEast;
         dist=Math.sqrt(north*north+east*east);
         a=180/Math.PI*Math.atan2(east,north); // in degrees, -floatingEyesis.angle
//document.title+=" n="+Math.round(north*1000)/1000+" e="+Math.round(east*1000)/1000+" a="+Math.round(a*10)/10+" d="+Math.round(dist*1000)/1000;
         floatingEyesis.angle=-a;
         floatingEyesis.distance=dist;
//document.title=" f0="+floatingEyesis.angle+" f2="+floatingEyesis.distance;
         updatePositionControlsAndMap();
         drawScene();
      }
    }
  } else {
     var x=newX-left;
     var y=newY-top;
     if ((x<0) || (x>=size) || (y<0) || (y>=size)) return false; // mouse over, but not over plan
//      document.title+=" x="+x+" y="+y;

     if ((x<moveHot) && (y<moveHot))                      document.body.style.cursor="move";
     else if ((x>=(size-moveHot)) && (y>=(size-moveHot))) document.body.style.cursor="nw-resize";
     else document.body.style.cursor="default";

     
//document.body.style.cursor="pointer";

  }
  lastMouseX = newX;
  lastMouseY = newY;

  return true;
}

//    if (editEnabled && (currentArrow>0) && (floatingEyesisNum<0)) cloneEyesis(currentArrow); // copy current camera to pair (ghost/edit, show control fields)


function movePlanView(dx,dy){
  var top= parseInt(document.getElementById("idPlanView").style.top)+dy;
  var left= parseInt(document.getElementById("idPlanView").style.left)+dx;
  document.getElementById("idPlanView").style.top= top+"px";
  document.getElementById("idPlanView").style.left=left+"px";
}

function resizePlanView(dx,dy){
  var minPlanViewSize=100;
  var width= parseInt(document.getElementById("idPlanView").style.width)+dx;
  var height= parseInt(document.getElementById("idPlanView").style.height)+dy;
  if (width>height) height=width;
  else width=height;
  if (width<minPlanViewSize)  width= minPlanViewSize;
  if (height<minPlanViewSize) height=minPlanViewSize;
  document.getElementById("idPlanView").style.width= width+"px";
  document.getElementById("idPlanView").style.height=height+"px";
  drawScene();
}



function showPlanView(show){
  if (typeof(fovYMaxPlan)=='undefined')fovYMaxPlan=fovYMax;
  if (show) {
    var size= parseInt(document.getElementById("idPlanView").style.width);
    var top= parseInt(document.getElementById("idPlanView").style.top);
    var left= parseInt(document.getElementById("idPlanView").style.left);
    var innerHTML=""; // TODO: will it be faster if the divs will be just 
    var x,y,dist,a;
    var offs=Math.round((settings.planDotSize-1)/2);
//if (document.getElementById("idPlanView").style.display=="none") alert ("size="+size+"\ntop="+top+"\nleft="+left);

// TODO: add this point
    for (var i=(floatingEyesisNum>=0)?-1:0;i<arrows.length;i++) if ((i<0) || (arrows[i].type=='c')){ // 0 - same
// arrows[0] - azimuth
// arrows[2]>0 = arrow, <0 camera, abs(arrows[2] - distance (meters)
//floatingEyesisNum
      var i0=(i<0)?floatingEyesisNum:i;
      var visibility=settings.markVisibility3d?(map[i0].open!==false):(map[i0].visibility!==false);
      var color=(i<0)?settings.planColorSelected:((i==floatingEyesisNum)? settings.planColorGhost:((i==0)?settings.planThisColor:(visibility?settings.planColor:settings.planColorInvisible)));
      var ts="";
/*      
      if (typeof(map[i0].description)!='undefined') ts+=' '+map[i0].description;
      else if (typeof(map[i0].name)!='undefined')   ts+=' '+map[i0].name;
*/      
      if (typeof(map[i0].name)!='undefined')   ts+=map[i0].name+" - ";
      if (typeof(map[i0].description)!='undefined') ts+=map[i0].description+" ";
      ts+=map[i0].time.hour+":"+map[i0].time.minute+":"+Math.round(map[i0].time.second*10)/10;
      
      if (i<0) {
        dist=Math.abs(floatingEyesis.distance)/settings.range*fovYMaxPlan/fovY; // Fraction of half square side
        a=Math.PI/180*(-floatingEyesis.angle-azimuth); // for some reason - negative
      } else {
        dist=Math.abs(arrows[i].distance)/settings.range*fovYMaxPlan/fovY; // Fraction of half square side
        a=Math.PI/180*(-arrows[i].angle-azimuth);
      }

      x=Math.round(size/2*(1+dist*Math.sin(a)))-offs;
      y=Math.round(size/2*(1-dist*Math.cos(a)))-offs;
      var zindex=(i<0)?3:(map[i].visibility?2:1);
//if (document.getElementById("idPlanView").style.display=="none") alert ("dist="+dist+"\nx="+x+"\ny="+y);
      if ((x>=0) && (y>=0) && (x<(size-settings.planDotSize)) && (y<(size-settings.planDotSize))) {
        innerHTML+='<div id="idPlanViewPoint'+(i)+'" title="'+ts+
                   '" style="position:absolute;width:'+settings.planDotSize+'px;height:'+settings.planDotSize+'px;top:'+y+'px;left:'+x+'px;'+
		   '-moz-border-radius:'+(settings.planDotSize/2)+'px;'+
		   '-webkit-border-radius:'+(settings.planDotSize/2)+'px;'+
		   'border-radius:'+(settings.planDotSize/2)+'px;'+
		   'cursor:pointer;'+
                   'background-color:'+color+';z-index:'+zindex+';" onmousedown="handlePlanMouseDown(event,'+i+','+((i<0) || map[i].visibility || settings.markVisibility3d)+')">&nbsp;</div>';
//onmousedown="handlePlanMouseDown(-2);     
      }
    }
//TODO: add selected
    document.getElementById("idPlanView").innerHTML=innerHTML;
//if (document.getElementById("idPlanView").style.display=="none") alert (document.getElementById("idPlanView").innerHTML);
    document.getElementById("idPlanView").style.display="block";
  } else {
    document.getElementById("idPlanView").style.display="none";
  }
}
