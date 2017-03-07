/*!***************************************************************************
*! FILE NAME  : g_map.js
*! DESCRIPTION: functions for Google Map API
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
*! $Log: g_map.js,v $
*!
*/
  
var icon_dot;
var icon_dot_blue;
var icon_eyesis;

var gm_points = new Array();

function gm_init_vars(){
    icon_dot = new GIcon();
    icon_dot.image = "files/map_icons/small_dot.png";
    icon_dot.iconSize = new GSize(12, 12);
    icon_dot.iconAnchor = new GPoint(6, 6);

    icon_dot_blue = new GIcon();
    icon_dot_blue.image = "files/map_icons/small_dot_blue.png";
    icon_dot_blue.iconSize = new GSize(12, 12);
    icon_dot_blue.iconAnchor = new GPoint(6, 6);

    icon_eyesis = new GIcon();
    icon_eyesis.image = "files/map_icons/eyesis_icon.png";
    icon_eyesis.iconSize = new GSize(28, 40);
    icon_eyesis.iconAnchor = new GPoint(14, 40);

    icon_eyesis.shadow = "files/map_icons/eyesis_shadow.png";
    icon_eyesis.shadowSize = new GSize(50, 40);
}

function gm_place_point(mark,n) {
    
  if (n==0) {
    gmap.setCenter(new GLatLng(mark.latitude,mark.longitude), zoom);
  }
  
  if (n==0) var icon = icon_eyesis;
  else      var icon = icon_dot;
  
  gm_create_marker(mark,icon);
}

function gm_create_marker(mark,icon){
  
    var i = mark.href;
    //var i = mark.href.substr(mark.href.lastIndexOf('/')+1);
  
    var point = new GLatLng(mark.latitude, mark.longitude);
    
    gm_points[i] = new GMarker(point,icon);
    
    GEvent.addListener(gm_points[i], "click", function() {
	//gm_set_current_position(mark);
	//var req = "?kml="+settings.kml+"&href="+mark.href;
	getMapNodes(serverURL,mark.href);
    });
    GEvent.addListener(gm_points[i], "mouseover", function() {
	if (mark.href!=gm_CurrentMarker.href) gm_points[i].setImage(icon_dot_blue.image);
    });
    GEvent.addListener(gm_points[i], "mouseout", function() {
	if (mark.href!=gm_CurrentMarker.href) gm_points[i].setImage(icon_dot.image);
    });
    
    gmap.addOverlay(gm_points[i]);
    
}

function gm_set_current_position(mark){
    gm_set_icon(gm_CurrentMarker,icon_dot);
    gm_set_icon(mark,icon_eyesis);    
    gm_CurrentMarker = mark;    
}

function gm_remove_marker(i){
    gmap.removeOverlay(gm_points[i]);
}

function gm_set_icon(mark,icon) {
    gm_remove_marker(mark.href);
    //gm_remove_marker(mark.href.substr(mark.href.lastIndexOf('/')+1));
    gm_create_marker(mark,icon);    
}
