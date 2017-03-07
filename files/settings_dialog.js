/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : settings_dialog.js
*! REVISION   : 1.0
*! DESCRIPTION: Settings menu
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
*! By doing this you can give the whole community a chance to benefit from your changes. 
*! Access to the source code is a precondition for this. 
*! -----------------------------------------------------------------------------**
*/

var idSettingsDialog_flag = false;

$(function() {

	$("#idInfo_toggle").click(function(e){
		$("#idInfo_table").toggle();
		if ($("#idInfo_toggle").html()=="hide info") $("#idInfo_toggle").html("show info");
		else                                         $("#idInfo_toggle").html("hide info");
	});
  
	$("#idInfo_toggle").click();
	
	$("#idSettings").click(function(e){
	  
	  	$("#idViewsDialog").hide();
		$("#idHelpDialog").hide();
		$("#idSettingsDialog").toggle();
		
		fillSettingsMenu();
	});

	$("#idSettingsDialogOkButton").click(function(e){
		$("#idSettingsDialog").hide();
		applySettingsMenu();
	});

	$("#idSettingsDialogCancelButton").click(function(e){
		$("#idSettingsDialog").hide();
		fillSettingsMenu();
	});

// 	$("#idSettingsEdit").click(function(e){
// 		settings.edit = $(this).attr("checked");
// 		applyEditModeView();
// 	});
	
	$("#idSettingsLabels").click(function(e){
		settings.labels = $(this).attr("checked");
		$("#idShowLabels").attr("checked",settings.labels);
		drawScene();
	});
	
	$("#idSettingsClosestIn2D").click(function(e){
		settings.closestIn2d = $(this).attr("checked");
	});
	
	$("#idSettingsKeepZoom").click(function(e){
		settings.keepZoom = $(this).attr("checked");
	});
	
	$("#idSettingsSeeThrough").change(function(e){
	  
		if ($(this).val()<0) $(this).val(0);
		if ($(this).val()>0.99) $(this).val(0.99);
		
		settings.seethrough = $(this).val();
		updateSeeThrough();
	});
	
	$("#idSettingsTransitionTime").change(function(e){
		settings.transitionTime = $(this).val();
	});
	
// 	$("#idSettingsTransitionSteps").change(function(e){
// 		settings.transitionSteps = $(this).val();
// 	});
	
	$(       "#idSettingsDotSize").change(function(){settings.planDotSize = $(this).val();drawScene();});
	
	$(     "#idSettingsThisColor").change(function(){settings.planThisColor = $(this).val();     $("#idSettingsThisColorSample").css({background:settings.planThisColor});          drawScene();});
	$(         "#idSettingsColor").change(function(){settings.planColor = $(this).val();         $("#idSettingsColorSample").css({background:settings.planColor});                  drawScene();});
	$( "#idSettingsSelectedColor").change(function(){settings.planColorSelected = $(this).val(); $("#idSettingsSelectedColorSample").css({background:settings.planSelectedColor});  drawScene();});
	$(    "#idSettingsGhostColor").change(function(){settings.planColorGhost = $(this).val();    $("#idSettingsGhostColorSample").css({background:settings.planGhostColor});        drawScene();});
	$("#idSettingsInvisibleColor").change(function(){settings.planColorInvisible = $(this).val();$("#idSettingsinvisibleColorSample").css({background:settings.planColorInvisible});drawScene();});
	
	$("#idViews").click(function(e){
	  	$("#idSettingsDialog").hide();
		$("#idHelpDialog").hide();
		$("#idViewsDialog").toggle();
		//fillSettingsMenu();
	});
	
	$("#idGMap_checkbox").click(function(e){
	    if (this.checked) $("#map_div").show();
	    else              $("#map_div").hide();
	});
	
	$("#idOSMap_checkbox").click(function(e){
	    if (this.checked) $("#osmap_div").show();
	    else              $("#osmap_div").hide();
	});
	
	$("#idHelp").click(function(e){
	  	$("#idViewsDialog").hide();
		$("#idSettingsDialog").hide();
		$("#idHelpDialog").toggle();
		//fillSettingsMenu();
	});
	
	$("#idSettingsView").click(function(e){
	    settings.view = this.checked;
	    clickedArrow(0);
	});
	
});

var mapping_list= new Array("full","interpolate","all","full-all");

function fillSettingsMenu() {
  
 	//alert(kml_list.length+" vs "+kml_masks_list.length);
  
	$("#kml_proto_list").html(list_html("kml_list",kml_list));
	jquery_list('kml_proto_list',settings.proto);
	
	//$("#idSettingsMask").val(settings.mask);
	var tmp_list_value;
	if ((typeof(settings.mask)=="undefined") || (settings.mask=="")) tmp_list_value='Choose a corresponding mask';
	else                                                             tmp_list_value= settings.mask;
	
	$("#kml_mask_list").html(list_html("kml_masks_list",kml_masks_list));
	jquery_list('kml_mask_list',tmp_list_value);
	
	$("#idSettingsEdit").attr("checked",settings.edit);
	
	$("#idSettingsKml").val(settings.kml);
	//$("#idSettingsProto").val(settings.proto);
	
	//alert($('#kml_mask_list').val()+"  "+settings.mask);
	
	$("#idSettingsNumTextures").val(settings.numTextures);
	
	$("#idSettingsStart").val(settings.start);
	
	$("#idSettingsRange").val(settings.range);
	$("#idSettingsAsCamera").val(settings.as_camera);
	$("#idSettingsLabels").attr("checked", settings.labels);
	$("#idSettingsClosestIn2D").attr("checked", settings.closestIn2d);
	$("#idSettingsKeepZoom").attr("checked", settings.keepZoom);
	$("#idSettingsSeeThrough").val(settings.seethrough);
	$("#idSettingsTransitionTime").val(settings.transitionTime);
// 	$("#idSettingsTransitionSteps").val(settings.transitionSteps);

	$("#idSettingsMap").val(settings.map);
	var tmp_map_value;
	if ((typeof(settings.map)=="undefined") || (settings.map=="")) tmp_map_value='Choose a map building method';
	else                                                           tmp_map_value= settings.map;
	
	$("#idSettingsMap").html(list_html("building_map_list",mapping_list));
	jquery_list('idSettingsMap',tmp_map_value);	

	$("#idSettingsFollow").attr("checked", settings.follow);
// 	$("#idSettingsVisibility3d").attr("checked", settings.Visibility3d);
	$("#idSettingsMarkVisibility3d").attr("checked", settings.markVisibility3d);
	
	$("#idSettingsDotSize").val(settings.planDotSize);
	$("#idSettingsThisColor").val(settings.planThisColor);
	$("#idSettingsColor").val(settings.planColor);
	$("#idSettingsSelectedColor").val(settings.planColorSelected);
	$("#idSettingsGhostColor").val(settings.planColorGhost);

	$("#idSettingsInvisibleColor").val(settings.planColorInvisible);

	$("#idSettingsThisColorSample").css(     {background:settings.planThisColor});
	$("#idSettingsColorSample").css(         {background:settings.planColor});
	$("#idSettingsSelectedColorSample").css( {background:settings.planColorSelected});
	$("#idSettingsGhostColorSample").css(    {background:settings.planColorGhost});
	$("#idSettingsInvisibleColorSample").css({background:settings.planColorInvisible});
	
};

function applySettingsMenu() {
  
	var updateNodes = false;
  
	if ((settings.proto!=$('#kml_proto_list').val())||(settings.kml!=$("#idSettingsKml").val())||(settings.mask!=$('#kml_mask_list').val())||(settings.start!=$("#idSettingsStart").val())||(settings.map!=$("#idSettingsMap").val())||(settings.range!=$("#idSettingsRange").val())||(settings.as_camera!=$("#idSettingsAsCamera").val())) {
	    updateNodes = true;
	}
	
	settings.edit               = $("#idSettingsEdit").attr("checked");
	
	settings.proto              = $('#kml_proto_list').val(); //$("#idSettingsProto").val();
	
	if (!typeof($("#idSettingsKml").val())||($("#idSettingsKml").val()=="")) settings.kml = settings.proto;
	else                                                                    settings.kml = $("#idSettingsKml").val();
	
	if ($('#kml_mask_list').val()=='Choose a corresponding mask') settings.mask = "";
	else                                                          settings.mask = $('#kml_mask_list').val();//$("#idSettingsMask").val();
	
	//settings.numTextures        = $("#idSettingsNumTextures").val();
	settings.start              = $("#idSettingsStart").val();
	
	settings.range              = $("#idSettingsRange").val();
	settings.as_camera          = $("#idSettingsAsCamera").val();
	
	settings.labels             = $("#idSettingsLabels").attr("checked");
	settings.closestIn2d        = $("#idSettingsClosestIn2D").attr("checked");
	settings.keepZoom           = $("#idSettingsKeepZoom").attr("checked");
	
	settings.seethrough         = $("#idSettingsSeeThrough").val();
	settings.transitionTime     = $("#idSettingsTransitionTime").val();
	
	settings.follow             = $("#idSettingsFollow").attr("checked");
// 	settings.Visibility3d       = $("#idSettingsVisibility3d").attr("checked");
	settings.markVisibility3d   = $("#idSettingsMarkVisibility3d").attr("checked");
	
// 	settings.transitionSteps    = $("#idSettingsTransitionSteps").val();
	if ($("#idSettingsMap").val()=='Choose a map building method') settings.map = "";
	else                                                           settings.map = $('#idSettingsMap').val();//$("#idSettingsMask").val();
	
	//settings.map                = $("#idSettingsMap").val();
	
	settings.planDotSize        = $("#idSettingsDotSize").val();
	settings.planThisColor      = $("#idSettingsThisColor").val();
	settings.planColorSelected  = $("#idSettingsSelectedColor").val();
	
	settings.planColorGhost     = $("#idSettingsGhostColor").val();
	settings.planColorInvisible = $("#idSettingsInvisibleColor").val();
  
	settings.view = $("#idSettingsView").attr("checked");
	
	//settings.fovy = fovY;
	//applySettings();
	fillSettingsMenu();
		
	//if (updateNodes) webGLInitialGetNodes();
	
	if (updateNodes) {
	      initialize_maps_nowebgl();
	}
	else{
	      clickedArrow(0); // reload saved file
	      drawScene();
	}
	
	
}

function createPermanentLink() {
	  
	var string = "<a href='";
	string+= window.location.href.substr(0,window.location.href.lastIndexOf('?'));
	string+="?kml="+settings.kml;
	string+="&proto="+settings.proto;
	if ((typeof(settings.view)!="undefined")  && (settings.view))    string+="&view";   // force view only mode
	string+="&ntxt="+settings.numTextures;
	string+="&as_camera="+settings.as_camera;
	string+="&start="+map[0].href.substr(map[0].href.lastIndexOf('/')+1);
	string+="&range="+settings.range;
	string+="&labels="+settings.labels;
	string+="&keepzoom="+settings.keepZoom;
	string+="&closest2d="+settings.closestIn2d;
	string+="&seethrough="+settings.seethrough;
	string+="&transition="+settings.transitionTime;
	string+="&mask="+settings.mask;
	if ((typeof(settings.map)!="undefined") && (settings.map!="")) string+="&map="+settings.map;
	string+="&azimuth="+(Math.round(azimuth*10)/10);
	string+="&elevation="+(Math.round(elevation*10)/10);
	string+="&zoom="+(Math.round(currentZoom*1000)/1000);
	string+="&follow="+settings.follow;
	string+="&mv3d="+settings.markVisibility3d;
	string+="&fovy="+settings.fovy;
	string+="'>Permanent Link</a>";
	$('#idPermanentLink_div').html(string);
}

function hideMenus() {
  //$('#idDialogs').hide();
  $('#idTopRightCorner').hide();
  $('#idInfo').hide();
  //$('#idPlanView').hide();
  //$('#idLabels').hide();
}

function showMenus() {
  //$('#idDialogs').hide();
  $('#idTopRightCorner').show();
  $('#idInfo').show();
}

var kml_list=Array();
var kml_masks_list=Array();

function get_filelist(){
    $.ajax({
        url: "filelist.php?type=kml",
        type: "GET",
	async:false,
        success: function(xml){
	      list = xml.getElementsByTagName("f");
	      for(var i=0;i<list.length;i++) {
		  var tmp = list[i].firstChild.data;
		  if (tmp.lastIndexOf("mask")!=-1) {
		      kml_masks_list[kml_masks_list.length] = tmp;
		  }else{
		      kml_list[kml_list.length] = tmp;
		  }
	      }
	}
    });
}

function list_html(id,list){
    var tmp = "<ul id="+id+">";

    for(var i=0; i<list.length; i++) {
	tmp = tmp + "<li>"+list[i]+"</li>";
    }
    tmp = tmp + "</ul>";
    
    return tmp;
}




