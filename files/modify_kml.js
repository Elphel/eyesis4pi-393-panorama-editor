/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : modify_kml.js
*! DESCRIPTION: Sends modified map data to the server
*! Copyright (C) 2011 Elphel, Inc.
*!
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
*/
function generateKML(nodes){

    var return_string = "<kml xmlns='http://earth.google.com/kml/2.2'>\n<Document>\n";
  
    for(var i in nodes) {
	return_string += "\
	\t<PhotoOverlay>\n\
	\t\t<name>"+nodes[i].name+"</name>\n\
	\t\t<description>"+nodes[i].description+"</description>\n\
	\t\t<visibility>"+(nodes[i].visibility?1:0)+"</visibility>\n\
	\t\t<Camera>\n\
	\t\t\t<longitude>"+nodes[i].longitude+"</longitude>\n\
	\t\t\t<latitude>"+nodes[i].latitude+"</latitude>\n\
	\t\t\t<altitude>"+nodes[i].altitude+"</altitude>\n\
	\t\t\t<heading>"+nodes[i].heading+"</heading>\n\
	\t\t\t<tilt>"+nodes[i].tilt+"</tilt>\n\
	\t\t\t<roll>"+nodes[i].roll+"</roll>\n\
	\t\t</Camera>\n\
	\t\t<Icon>\n\
	\t\t\t<href>"+nodes[i].href+"</href>\n\
	\t\t</Icon>\n";
	if (typeof(nodes[i].v3d)!='undefined') {
	  return_string += "\
	\t\t<ExtendedData>\n\
	\t\t\t<Visibility3d>\n";
	  for (var j in nodes[i].v3d) {
	    return_string += "\
	\t\t\t\t<v3Range>\n";
	    if (typeof(nodes[i].v3d[j].from)!='undefined') return_string +="\t\t\t\t\t\t<from>"+nodes[i].v3d[j].from+"</from>\n";
	    if (typeof(nodes[i].v3d[j].to)  !='undefined') return_string +="\t\t\t\t\t\t<to>"+  nodes[i].v3d[j].to+  "</to>\n";
	    return_string += "\
	\t\t\t\t</v3Range>\n";
	  }
	  return_string += "\
	\t\t\t</Visibility3d>\n\
	\t\t</ExtendedData>\n";
	}  
	
	return_string += "\
	\t</PhotoOverlay>\n";
    }

    return_string += "</Document>\n</kml>";

    return return_string;

}

function postKmlData(filename, xml) { 
    $.ajax({
        url: "modify_kml.php?kml="+filename,
        type: "POST",
        dataType: "xml",
        data: xml,
	async:false,
        complete: function(response){},
        contentType: "text/xml; charset=\"utf-8\""
    });
}