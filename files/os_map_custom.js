/*!***************************************************************************
*! FILE NAME  : os_map.js
*! DESCRIPTION: functions for OpenLayers Open Street Map API
*! Copyright (C) 2011 Elphel, Inc
*! -----------------------------------------------------------------------------**
*!
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
*! -----------------------------------------------------------------------------**
*! 
*! $Log: os_map.js,v $
*!
*/

// globals for map
var osm_markers = new Array();
var kml_response;
var map_points = new Array();
var N=0;

var osmap;
var osm_points = new Array();

var osm_CurrentMarker;

var osm_zoom=18;

var icon_eyesis4pi;
var icon_dot_green;
var icon_dot_blue;

function osm_init(){
  
  console.log("map init!");
  
  icon_eyesis4pi = L.icon({
    iconUrl: "files/map_icons/eyesis4pi_icon.png",
    iconSize: [30,70],
    iconAnchor: [15,70]
  });
  
  icon_dot_green = L.icon({
    iconUrl: "files/map_icons/small_dot.png",
    iconSize: [12,12],
    iconAnchor: [6,6]
  });
  
  icon_dot_blue = L.icon({
    iconUrl: "files/map_icons/small_dot_blue.png",
    iconSize: [12,12],
    iconAnchor: [6,6]
  });
  
  osmap = L.map('osmap').setView([40.723407, -111.932970], 12);
  
  L.tileLayer('http://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data and images &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: osm_zoom,
  }).addTo(osmap);
  
  /*
  L.marker([40.723407, -111.932970],{icon:icon_eyesis4pi}).addTo(osmap).on("click",function(e){
    console.log("Youclicked "+e.latlng);
    this.setIcon(icon_dot_green);
  });
  */
}

function osm_place_points(){
    console.log("Place points!");
    osm_points = new Array();
    
    for (var i=map_points.length-1;i>=0;i--) {
	osm_place_point(map_points[i],i);
    }
    osm_CurrentMarker = map_points[0];
}

function osm_place_point(mark,n) {
   
    var icon;
  
    if (n==0) {
      osmap.setView([mark.latitude, mark.longitude]);
    }
  
    if (n==0) var icon = icon_eyesis4pi;    
    else      var icon = icon_dot_green;
    
    osm_create_marker(mark,icon);
        
}

function osm_create_marker(mark,icon) {
        
    var point = L.marker([mark.latitude, mark.longitude],{icon:icon});
    $(point).attr("index",mark.thisnode);
    
    point.on("click",function(){
      //clearInterval(intvl);
      //osm_set_current_position(mark);
      osm_remove_points();
      //set_image_number(mark.thisnode);
      getMapNodes(serverURL,mark.href);
    });
    
    point.on("mouseover",function(){
      if (mark.href!=osm_CurrentMarker.href) this.setIcon(icon_dot_blue);
    });

    point.on("mouseout",function(){
      if (mark.href!=osm_CurrentMarker.href) this.setIcon(icon_dot_green);
    });
    
    //point.addTo(osmap);
    osmap.addLayer(point);
    
    osm_points[mark.thisnode] = point;
    
}

function osm_set_current_position(mark) {
    console.log("setting center:");
    console.log(mark);
    osm_set_icon(osm_CurrentMarker,icon_dot_green);
    osm_set_icon(mark,icon_eyesis4pi);
    osm_CurrentMarker = mark;
}

function osm_remove_marker(i) {
        osmap.removeLayer(osm_points[i]);
}

function osm_set_icon(mark,icon) {
    osm_points[mark.thisnode].setIcon(icon);
}

function osm_remove_points(){
    console.log("Remove points! "+map_points.length);
    for (i=0;i<map_points.length;i++) {
	osm_remove_marker(i);
    }    
}
