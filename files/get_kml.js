/*! -----------------------------------------------------------------------------**
 *! FILE NAME  : get_kml.js
 *! DESCRIPTION: Receives and parses local map information
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
  var gXML_req;
  function requestKml(url,callbacFunc) { // callbacFunc should accept array of panorama parameters as an argument
    gXML_req=new XMLHttpRequest();
    gXML_req.open("GET", url, true);

    gXML_req.onreadystatechange = function() {
      if (typeof(gXML_req)=="undefined") return; ///
      if (gXML_req.readyState == 4) {
        if (((gXML_req.status >= 200) && (gXML_req.status < 300)) || (gXML_req.status ==304) ||
             ((typeof(gXML_req.status) =='undefined' ) && ((navigator.userAgent.indexOf("Safari")>=0) ||
             (navigator.userAgent.indexOf("Konqueror")>=0)))) {
            parseKML(gXML_req.responseXML,callbacFunc);
            return;
         } else {
          if (gXML_req.status) { 
             alert("There was a problem retrieving the XML data:\n" + (gXML_req.status?gXML_req.statusText:"gXML_req.status==0")+
             "\nYou may safely ignore this message if you just reloaded this page");

          }
        }
      }
    }
    gXML_req.send(null);
  }
  function parseKML(xml,callbacFunc) {
  	document.debugXML=xml;
    var node;
    var panos=[];
    map_points= new Array();
    var pano;
    var cameraHeading=55; // get from KML - heading of the camera when "vehicle" is straight North
    var aboveGround=2.05; // get from KML - different for car/person
    var cameraType="eyesis_backpack";     // pedestrian
    var isWritable=true;
    if (xml.getElementsByTagName('open').length>0) {
    	isWritable= (parseInt(xml.getElementsByTagName('open')[0].firstChild.nodeValue)>0);
    }
    if (xml.getElementsByTagName('ExtendedData').length>0) { // new: added above ground and camera type
       var nodeExtendedData=xml.getElementsByTagName('ExtendedData')[0];
       if (nodeExtendedData.getElementsByTagName('cameraType').length>0) cameraType= nodeExtendedData.getElementsByTagName('cameraType')[0].firstChild.nodeValue;
       if (nodeExtendedData.getElementsByTagName('aboveGround').length>0)aboveGround=parseFloat(nodeExtendedData.getElementsByTagName('aboveGround')[0].firstChild.nodeValue);
    }
    console.log(" aboveGround="+aboveGround+" cameraType="+cameraType);
    if (xml.getElementsByTagName('PhotoOverlay').length>0) {
      for (var numNode=0;numNode<xml.getElementsByTagName('PhotoOverlay').length;numNode++) {
          node=xml.getElementsByTagName('PhotoOverlay')[numNode];
          if (node.getElementsByTagName('Camera').length>0) {
             nodeCam=node.getElementsByTagName('Camera')[0];
             pano={};
             pano.thisnode = numNode;
             if (nodeCam.getElementsByTagName('longitude').length>0)    pano.longitude=parseFloat(nodeCam.getElementsByTagName('longitude')[0].firstChild.nodeValue);
             if (nodeCam.getElementsByTagName('latitude').length>0)     pano.latitude= parseFloat(nodeCam.getElementsByTagName('latitude')[0].firstChild.nodeValue);
             if (nodeCam.getElementsByTagName('altitude').length>0)     pano.altitude= parseFloat(nodeCam.getElementsByTagName('altitude')[0].firstChild.nodeValue);
             if (nodeCam.getElementsByTagName('heading').length>0)      pano.heading=  parseFloat(nodeCam.getElementsByTagName('heading')[0].firstChild.nodeValue);
             if (nodeCam.getElementsByTagName('tilt').length>0)         pano.tilt=     parseFloat(nodeCam.getElementsByTagName('tilt')[0].firstChild.nodeValue);
             if (nodeCam.getElementsByTagName('roll').length>0)         pano.roll=     parseFloat(nodeCam.getElementsByTagName('roll')[0].firstChild.nodeValue);
             if (node.getElementsByTagName('Icon').length>0) {
               var nodeIcon=node.getElementsByTagName('Icon')[0];
               if (nodeIcon.getElementsByTagName('href').length>0)   pano.href=nodeIcon.getElementsByTagName('href')[0].firstChild.nodeValue;
             }
             if (node.getElementsByTagName('name').length>0)         pano.name=           (parseInt(node.getElementsByTagName('name')[0].firstChild.nodeValue)); // name is map index
             if (node.getElementsByTagName('description').length>0)  pano.description=     node.getElementsByTagName('description')[0].firstChild.nodeValue;
             if (node.getElementsByTagName('visibility').length>0)   pano.visibility=     (parseInt(node.getElementsByTagName('visibility')[0].firstChild.nodeValue)>0);
             else pano.visibility=true; // undefined visible
             if (node.getElementsByTagName('open').length>0)         pano.open=           (parseInt(node.getElementsByTagName('open')[0].firstChild.nodeValue)>0);
             
             if (node.getElementsByTagName('TimeStamp').length>0) {
               var nodeTimestamp=node.getElementsByTagName('TimeStamp')[0];
               if (nodeTimestamp.getElementsByTagName('when').length>0) {
                 var whenStr=nodeTimestamp.getElementsByTagName('when')[0].firstChild.nodeValue;
                 var whenArr=whenStr.replace(/[:\-TZ]/ig," ").split(" ");
                 pano.time= {year:   parseInt(whenArr[0]),
                             month:  parseInt(whenArr[1]),
                             day:    parseInt(whenArr[2]),
                             hour:   parseInt(whenArr[3]),
                             minute: parseInt(whenArr[4]),
                             second: parseFloat(whenArr[5])};
               }  
             }
// read array of 3d-visibility ranges, will use 'name' as node number
             if (node.getElementsByTagName('ExtendedData').length>0) {
               var nodeExtendedData=node.getElementsByTagName('ExtendedData')[0];
               if (nodeExtendedData.getElementsByTagName('Visibility3d').length>0) {
                 var nodeVisibility3d=nodeExtendedData.getElementsByTagName('Visibility3d')[0];
                 pano.v3d=[];
                 for (var i=0; i<nodeVisibility3d.getElementsByTagName('v3Range').length;i++) {
                   var nodev3Range=nodeVisibility3d.getElementsByTagName('v3Range')[i];
                   var range={};
                   if (nodev3Range.getElementsByTagName('from').length>0) range.from=parseInt(nodev3Range.getElementsByTagName('from')[0].firstChild.nodeValue);
                   if (nodev3Range.getElementsByTagName('to').length>0)   range.to=  parseInt(nodev3Range.getElementsByTagName('to')[0].firstChild.nodeValue);
                   pano.v3d.push(range);
                 }
               } 
             }
             pano.cameraHeading=cameraHeading; // replace with parsing
             pano.aboveGround=aboveGround; // replace with parsing
             pano.cameraType=cameraType; // replace with parsing
/*             
           var debugstr="open: "+pano.open+"\n";
           if (typeof(pano.v3d)!='undefined') for (var i=0;i<pano.v3d.length;i++) {
             debugstr+="v3d["+i+"]:\n  from:"+pano.v3d[i].from+"\n  to:"+pano.v3d[i].to+"\n";
           }
           alert (debugstr);
*/
/*             alert ("name="+    pano.name+"\n"+
              "description="+   pano.description+"\n"+
              "visibility="+    pano.visibility+"\n"+
              "cameraHeading="+ pano.cameraHeading+"\n"+
              "aboveGround="+   pano.aboveGround+"\n"+
              "cameraType="+    pano.cameraType);
*/             
// temporary, get from KML later             
//             alert ("pano data="+pano.toString());
             panos.push(pano);
             map_points.push(pano);
	 }  
      }
    }
    callbacFunc(panos,isWritable);
  }
/*
<TimeStamp>
<when>2011-04-22T17:06:08.466930Z</when>
</TimeStamp>
*/