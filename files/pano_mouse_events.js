/*! -----------------------------------------------------------------------------**
 *! FILE NAME  : pano_mouse_events.js
 *! DESCRIPTION: Handles mouse events in panorama viewer/editor
 *! Copyright (C) 2011 Elphel, Inc.
 *!
 *! -----------------------------------------------------------------------------**
 **  
 **  this program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU General Public License as published by
 **  the Free Software Foundation, either version 3 of the License, or
 **  (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU General Public License for more details.
 **
 **  You should have received a copy of the GNU General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **
 */

  var fovY = 45;

  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;
  var showArrows = true;
  var arrowsVisible=[];
  var arrowsXY=[];
  var currentArrow= -2; // -1 - floating Eyesis
  var shiftKey=false;
  var ctrlKey=false;
  var altKey=false;
  var viewRotationMatrix = Matrix.I(4);   // current view rotation matrix
  var panoramaRotationMatrix = Matrix.I(4); // rotation matrix of the current panorama relative to the world
  var previousPanoramaRotationMatrix;    // rotation matrix of the current panorama relative to the world

  function handleKeyUp(event) {
    floatingEyesisHorizontal=true;
  }

  function handleMouseDown(event) {
    shiftKey= event.shiftKey && !event.altKey && editEnabled;
    ctrlKey=  event.ctrlKey  && !event.altKey && editEnabled;
    altKey=   event.altKey   && editEnabled; // press with SHIFT to disable
    floatingEyesisHorizontal= !altKey && !verticalEnabled;

//    if (floatingEyesisHorizontal) currentArrow=-1; // if started moving with SHIFT then released/pressed mouse while shift is held - continue dragging that camera
//document.title="floatingEyesisXY[0]="+floatingEyesisXY[0]+" floatingEyesisXY[1]="+floatingEyesisXY[1]+" currentArrow="+currentArrow+" floatingEyesisDragging="+floatingEyesisDragging+" floatingEyesisHorizontal="+floatingEyesisHorizontal+" altKey="+altKey;
    if (!editEnabled && !shiftKey && !ctrlKey && (currentArrow>=0)) { // all hyperjumps are disabled in edit mode. Maybe just need to ask for confirmation/save edits
      clickedArrow(currentArrow);
      return;  // was no return here
    }
//    if (editEnabled && (currentArrow>0) && (floatingEyesisNum<0)) cloneEyesis(currentArrow); // copy current camera to pair (ghost/edit, show control fields)
    if (editEnabled && (currentArrow>=0) && (floatingEyesisNum<0)) cloneEyesis(currentArrow); // copy current camera to pair (ghost/edit, show control fields)
    floatingEyesisDragging=editEnabled && (currentArrow>=-1);
//    if (editEnabled && (currentArrow>=-1) && shiftKey && ctrlKey) floatingEyesisHorizontal=true; // CNTRL+SHIFT, not to start SHIFT-move accidentally
//    if (editEnabled && (currentArrow>=-1) && altKey) floatingEyesisHorizontal=true; // CNTRL+SHIFT, not to start SHIFT-move accidentally
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    if (ctrlKey && !floatingEyesisDragging) {
      var direction=azimuth + ((lastMouseX-gl.viewportWidth/2) /gl.viewportHeight*fovY);
      direction=Math.round (10*direction)/10;
      lockAxis(direction);

    }
    drawScene();
    savedX=event.clientX;
    savedY=event.clientY;


    if (floatingEyesisDragging) {
      floatingEyesisStart.angle=floatingEyesis.angle;
      floatingEyesisStart.down=floatingEyesis.down;
      floatingEyesisStart.distance=floatingEyesis.distance; // always>0?
    } else if (!shiftKey && !ctrlKey) {
      savedA=azimuth;
      savedE=elevation;
    } else {
      savedH=map[0].heading;
      savedT=map[0].tilt;
      savedR=map[0].roll;
    }
    ortoDir=-1;
  }

  function clickedArrow(num) {
//    alert ("clickedArrow("+num+")");
//      if (num==0) return; // do nothing if clicked self //try if it is OK
//      var url=serverURL+"?kml="+settings.kml+"&href="+map[num+1].href+"&range="+settings.range;
      var url=serverURL+"?kml="+settings.kml+"&href="+map[num].href+"&range="+settings.range;
      if ((typeof(settings.proto)!="undefined") && (settings.proto!="")) url+="&proto="+settings.proto; // use this KML file as a prototype for kml= (copy to kml if kml does not exist)
      if (settings.mask!="") url+="&mask="+settings.mask; // use second KML file to overwrite main KML file settings
      if (settings.map!="") url+="&map="+settings.map;   // specify if full map rebuild is needed (default - sequential) or if interpolation for "visibility=0" is needed
//      if (settings.Visibility3d) url+="&v3d"; 
      lastHeading=map[0].heading;// global
      waitForPano=true;
      document.body.style.cursor="wait";
      requestKml(url,kmlGot);
      return;
  }
  function clickedLabel(event,num) {
      currentArrow=num;
      handleMouseDown(event);
  }
  var azimuth=0;
  var elevation=0;

  function handleMouseUp(event) {
    mouseDown = false;
    mouseDownPlan=false;
  }

  function handleMouseMove(event) {
    if (handlePlanMouseMove(event)) return; // captured by handlePlanMouseMove()
    var newX = event.clientX;
    var newY = event.clientY;
    var needRedrawArrows=false;
    var overCanvas=(newX>=0) && (newY>=0) && (newX<gl.viewportWidth) && (newY<gl.viewportHeight);
    if (showArrows!=(overCanvas || editEnabled)) {
       showArrows=(overCanvas || editEnabled);
       needRedrawArrows=true;
    }
    if (!overCanvas) {
       document.body.style.cursor="default";
       if (needRedrawArrows) setTimeout ("drawScene()", 50 ); // That works! For some reason Chrome (sometimes) fails to show arrows when cursor is moved to over canvas from outside
       return;
    }
    if (!mouseDown) {
//document.title="handleMouseMove: currentArrow="+currentArrow;
       detectOverArrow(newX,newY);
       if (waitForPano) document.body.style.cursor="wait";
       else if (currentArrow>=-1) document.body.style.cursor="pointer";
       else if (editEnabled && ((event.shiftKey==1) || (event.ctrlKey==1))) document.body.style.cursor="crosshair";
       else document.body.style.cursor="move";
       lastMouseX=newX;
       lastMouseY=newY;
       if (needRedrawArrows) setTimeout ("drawScene()", 50 ); // That works! For some reason Chrome (sometimes) fails to show arrows when cursor is moved to over canvas from outside
      return;
    }

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;
    if (document.getElementById("idOrtho").checked) {
      var dX0 = newX - savedX
      var dY0 = newY - savedY;
      var k=Math.sqrt((dX0*dX0+dY0*dY0)/ (orthoStep*orthoStep));
      if (ortoDir<0) { // undefined yet - too small travel from the mousedown point
        lastMouseX=savedX;
        lastMouseY=savedY;
        deltaX = newX - lastMouseX;
        deltaY = newY - lastMouseY;
        if (floatingEyesisDragging) {
          floatingEyesis.angle=floatingEyesisStart.angle;
          floatingEyesis.down=floatingEyesisStart.down;
          floatingEyesis.distance=floatingEyesisStart.distance; // always>0?
        } else if (!shiftKey && !ctrlKey) {
          azimuth=savedA;
          elevation=savedE;
        } else {
          map[0].heading=savedH;
          map[0].tilt=savedT;
          map[0].roll=savedR;
        }
        if (deltaX*deltaX>deltaY*deltaY) deltaY=0;
        else                             deltaX=0;
        if (k>1.0) ortoDir=(deltaY*deltaY>deltaX*deltaX)?1:0;
       } else { // direction was set, maybe need to change
         if (k>1.0) { // rope is tight, move "weight" towards the current mouse pointer
            savedX=Math.round(savedX+dX0*(k-1)/k);
            savedY=Math.round(savedY+dY0*(k-1)/k);
            ortoDir=(dX0*dX0>dY0*dY0)?0:1; // only change direction if the "rope is tight"
         }
         if (ortoDir>0) deltaX=0;
         else           deltaY=0;
       }
    }
    if (floatingEyesisDragging) {
        document.body.style.cursor="move";
        floatingEyesis.angle=floatingEyesis.angle+(-deltaX /gl.viewportHeight*fovY);
//      while (floatingEyesis.angle<0)   floatingEyesis.angle+=360;
//      while (floatingEyesis.angle>=360)floatingEyesis.angle-=360;
      while (-floatingEyesis.angle<0)    floatingEyesis.angle-=360;
      while (-floatingEyesis.angle>=360) floatingEyesis.angle+=360;
      if (floatingEyesisHorizontal) { // move azimuth/distance (horizontal plane)
        floatingEyesis.distance=floatingEyesis.distance-Math.abs(floatingEyesis.distance)* Math.sin(Math.PI/180*deltaY /gl.viewportHeight*fovY);
      } else { // move azimuth/elevation (vertical plane)
        floatingEyesis.down=floatingEyesis.down+Math.abs(floatingEyesis.distance)* Math.sin(Math.PI/180*deltaY /gl.viewportHeight*fovY);
      }
      updatePositionControlsAndMap();
    } else if (!shiftKey && !ctrlKey) {
      document.body.style.cursor="move";
      azimuth=azimuth+(-deltaX /gl.viewportHeight*fovY);
      elevation=elevation+(-deltaY/gl.viewportHeight*fovY);
      while (azimuth<0)azimuth+=360;
      while (azimuth>=360)azimuth-=360;
      if (elevation>90) elevation=90;
      if (elevation<-90) elevation=-90;
      if (showInfo) showInformation();

//      var newRotationMatrix = createRotationMatrix(elevation, [1, 0, 0]);
//      viewRotationMatrix = newRotationMatrix.x(createRotationMatrix(azimuth, [0, 1, 0]));
    } else if (shiftKey) {
      document.body.style.cursor="crosshair";
      map[0].heading=map[0].heading+(deltaX /gl.viewportHeight*fovY);
      while (map[0].heading<0)map[0].heading+=360;
      while (map[0].heading>=360)map[0].heading-=360;
      var ang=deltaY/gl.viewportHeight*fovY;
      var axisDir;
      if (!directionIsLocked) { // rotate around horizontal axis perpendicular to view
        axisDir=(map[0].heading-azimuth)*Math.PI/180;
        map[0].tilt-=ang*Math.cos(axisDir);
        map[0].roll+=ang*Math.sin(axisDir);///
      } else {  // rotate around horizontal axis at lockedDirection
        axisDir=(map[0].heading-(lockedDirection+90))*Math.PI/180;
        var mouseDir=azimuth + ((newX-gl.viewportWidth/2) /gl.viewportHeight*fovY);
        ang/=Math.sin((mouseDir-lockedDirection)*Math.PI/180);
        map[0].tilt-=ang*Math.cos(axisDir);
        map[0].roll+=ang*Math.sin(axisDir); ///
      }
      if (map[0].tilt>(90+maxPanoTilt)) map[0].tilt=(90+maxPanoTilt);
      if (map[0].tilt<(90-maxPanoTilt)) map[0].tilt=(90-maxPanoTilt);
      if (map[0].roll> maxPanoTilt) map[0].roll=maxPanoTilt;
      if (map[0].roll<-maxPanoTilt) map[0].roll=-maxPanoTilt;
      recalcHTR();
      showInformation();
    }
    lastMouseX = newX
    lastMouseY = newY;
    drawScene();
  }
  
  function detectOverArrow(x,y) {
    var minRadius2= arrowRadius*arrowRadius;
    currentArrow= -2; // none, -1 - floating Eyesis, >=0 - regular eyesis or arrow
    var minDist=-1; // invalid
    var dx,dy,r2;
    if (floatingEyesisNum<0) {
      for (var i =1; i<arrowsVisible.length; i++) if ((i<arrows.length) && arrowsVisible[i] && (!editEnabled || (arrows[i].type=='c') ) ){ // arrowsXY[i].distance<0 means Eyesis, not arrow
         dx=x-arrowsXY[i].x;
         dy=y-arrowsXY[i].y;
         r2=dx*dx+dy*dy;
         if ((r2<minRadius2) && ((minDist<0) || (minDist>Math.abs(arrows[i].distance)))) {
            currentArrow=i;
            if (settings.closestIn2d)  minRadius2=r2;
            else  minDist=Math.abs(arrows[i].distance);
         }
      }
    } else if (floatingEyesisVisible){
       dx=x-floatingEyesisXY[0];
       dy=y-floatingEyesisXY[1];
       r2=dx*dx+dy*dy;
//       if ((r2<minRadius2) || floatingEyesisHorizontal) {
       if (r2<minRadius2) {
          currentArrow=-1;
       }
//document.title="floatingEyesisXY[0]="+floatingEyesisXY[0]+" floatingEyesisXY[1]="+floatingEyesisXY[1]+" dx="+dx+" dy="+dy+" currentArrow="+currentArrow+" floatingEyesisDragging="+floatingEyesisDragging+" floatingEyesisHorizontal="+floatingEyesisHorizontal;
    } 
  }

  
  
  function wheelEvent(event){
        var delta = 0;
        if (!event) event = window.event; // IE
        if (event.wheelDelta) { //IE+Opera
                delta = event.wheelDelta/120;
                if (window.opera) delta = -delta;
        } else if (event.detail) { // Mozilla
                delta = -event.detail/3;
        }
        if (delta)
                handleWheel(delta);
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
        shiftKey= (event.shiftKey==1);


  }


  function handleWheel(delta) {
     //console.log("HandleWheel: fovY: "+fovY);
    
     fovY=fovY*Math.pow(fovK,-delta);
     if ((fovY<fovYMin) && !shiftKey) fovY=fovYMin; // with SHIFT, any zoom is allowed
     if ((fovY>fovYMax) && !shiftKey) fovY=fovYMax; // with SHIFT, any zoom is allowed
     update_fovY();
     if (currentTextureHeight>0) {
       currentZoom=Math.round(1000*180*gl.viewportHeight/currentTextureHeight/fovY)/1000;
       showZoom();
     }


     drawScene();
  }

function addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

addEvent(window,"load",function(e) {
    addEvent(document, "mouseout", function(e) {
        e = e ? e : window.event;
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName == "HTML") {
            // stop your drag event here
            // for now we can just use an alert
            if (showArrows && !editEnabled) {
              showArrows=false;
              drawScene();
            }
            document.body.style.cursor="default";
//document.title+=">"+showArrows;

        }
    });
});
