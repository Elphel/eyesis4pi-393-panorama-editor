/*!*******************************************************************************
*! FILE NAME  : pano_index.js
*! DESCRIPTION: get the routes list
*! Copyright (C) 2011 Elphel, Inc
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
*!  The four essential freedoms with GNU GPL software:
*!  * the freedom to run the program for any purpose
*!  * the freedom to study how the program works and change it to make it do what you wish
*!  * the freedom to redistribute copies so you can help your neighbor
*!  * the freedom to distribute copies of your modified versions to others
*!
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*! -----------------------------------------------------------------------------**
*!
*/

function postRequest(cmd, xml) { 
    $.ajax({
        url: "pano_db_interface.php?cmd="+cmd,
        type: "POST",
        dataType: "xml",
        data: xml,
	async:false,
        complete: function(response){parse_response(response.responseXML,cmd);},
        contentType: "text/xml; charset=\"utf-8\""
    });
}

function getRequest(rq,callback) { 
    $.ajax({
        url: rq,
        type: "GET",
// 	async:false,
        complete: function(response){callback(response.responseText);},
    });
}

var res_arr = Array();

function parse_response(xml,cmd){
    var result="";
   
    res_arr = XMLToArray(xml);
     
    if (cmd=="GetRoutesAndKMLs") {
	//get also KML files
	var table_str = "<table>\
<tr>\
    <th>Route ID</th>\
    <th>Name</th>\
    <th>Description</th>\
    <th>Nodes</th>\
    <th>KML</th>\
    <th>Editable</th>\
</tr>";
	for (var i=0;i<res_arr.length;i++){
	    row_color = "rgba("+(220+60*(i%2))+","+(220+60*(i%2))+","+(220+60*(i%2))+",0.2)";
	    
	    var tmp_id    = (res_arr[i].ID==undefined)?"":res_arr[i].ID;
	    var tmp_name  = (res_arr[i].Name==undefined)?"":res_arr[i].Name;
	    var tmp_descr = (res_arr[i].Description==undefined)?"":res_arr[i].Description;
	    var tmp_nodes = (res_arr[i].Nodes==undefined)?"":res_arr[i].Nodes;
	    
	    var tmp_edit = (res_arr[i].Editable==undefined)?"No":res_arr[i].Editable;
	    var tmp_kml = tmp_id;
	  
	    table_str += "<tr id='r"+i+"' style='background:"+row_color+"' onclick='row_click_handler("+i+")'>\
<td><a href='webgl_panorama_editor.html?kml="+tmp_id+"'>"+tmp_id+"</a></td>\
<td><div style='width:150px;'>"+tmp_name+"</div></td>\
<td><div style='width:250px;'>"+tmp_descr+"</div></td>\
<td>"+(+tmp_nodes)+"</td>\
<td><a style='display:none;' href='display_kml.php?id="+tmp_id+"'>"+tmp_id+"</a></td>\
<td>"+tmp_edit+"</td>\
</tr>";
	}
	table_str +="</table>";
    }
   
   $("#route_list").html(table_str);
}

//siuda!
function row_click_handler(i){
    if   ($("#r"+i).attr('marked')=="true") {
	$("#r"+i).attr('marked',"false");
	$("#r"+i).css({background:$("#r"+i).attr('old_color')});
    }else{
	$("#r"+i).attr('marked',"true");
	$("#r"+i).attr('old_color',$("#r"+i).css("background-color"));
	$("#r"+i).css({background:"rgba(100,200,50,0.8)"});
	//disable others
	for (var j=0;j<res_arr.length;j++) {
	    if (i!=j) {
		$("#r"+j).css({background:$("#r"+j).attr('old_color')});
		$("#r"+j).attr('marked',"false");
	    }
	}
    }
}

function create_copy(){
    found_marked = false;
    $("#status").val("");
    for(var i=0;i<res_arr.length;i++){
	if ($("#r"+i).attr('marked')=="true") {
	    found_marked = true;
	    break;
	}
    }
    if (!found_marked) {
	$("#status").val("Please select one of the routes");
	return 0;
    }
    if ($("#input_fn").val()=="") {
	$("#status").val("Please enter the copy name");
	return 0;
    }
    
    if ($("#input_fn").val().substr(-3,3)!="kml") {
	$("#status").val("Incorrect file extension");
	return 0;
    }
    
    if($("#input_fn").val().match(/[\<\>!@#\$%^&\*,/]+/i) ) {
	$("#status").val("Unknown error");
	return 0;
    }
    
    var rq = "copy_kml.php?proto="+res_arr[i].ID+"&kml="+$("#input_fn").val();
    
    getRequest(rq,copy_done);
    
}

function copy_done(msg){
    $("#status").val(msg);
    postRequest("GetRoutesAndKMLs", "");
}

function xml_create(arr) {
  var result_str = "";
  for (var i=0;i<arr.length;i++) {
    var tmp_str = "";
    for(key in arr[i]) {
	tmp_str += XMLString_CreateNode("\t\t",key,arr[i][key]);
    }
    result_str += XMLString_Wrap("\t","node",tmp_str);
  }
  return XMLString_AddXMLHeader(result_str,"data");
}
 
function kml_create(arr) {
  var result_str = "";
  for (var i=0;i<arr.length;i++) {
      result_str += ArrayToXMLString(arr[i],"\t","PhotoOverlay");
  }
  return XMLString_AddKMLHeader(result_str,"Document");
}
