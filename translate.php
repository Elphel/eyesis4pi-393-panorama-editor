<?php
/********************************************************************************
*! FILE NAME  : translate.php
*! DESCRIPTION: for possible multilingual use, not finished
*! VERSION:     1.0
*! AUTHOR:      Oleg Dzhimiev <oleg@elphel.com>
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
*!  $Log: translate.php,v $
*!
*/

require_once("call_filter.php");

$xml = new simpleXMLElement("<?xml version='1.0' encoding='UTF-8'?><Document></Document>");

$xml->Titles->title = "Panorama Viewer/Editor v1.1";

$xml->Titles->idViewAzimuth    = "Turn 90 degrees right";
$xml->Titles->idViewElevation  = "Reset to 0 degrees";
$xml->Titles->idShowPlan_tip   = "Toggle a schematic plan of the map points locations";
$xml->Titles->idShowCams_tip   = "Toggle the camera models shown above the panorama texture";
$xml->Titles->idClickCams_tip  = "Click on the camera model or click on the footprint under the model to jump to the place of interest";
$xml->Titles->idShowLabels_tip = "Toggle distance showing labels";

$xml->Titles->idPermanentLink_div = "The permanent link to the current panorama with selected parameters";

$xml->Titles->idSettingsEdit_tip             = "Depends on the chosed base KML file";
$xml->Titles->idSettingsProto_tip            = "KML prototype file. Is used to create a new editable KML file. Choose an item from the list and fill in the KML file field";
$xml->Titles->idSettingsKml_tip              = "KML file - Map points geo location data. To create a new editable KML file - choose the prototype file first, then fill this field: 'kml_files/new-kml.kml'. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsMask_tip             = "KML mask file. Allows to filter the map points by setting visibility. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsStart_tip            = "Starting panorama filename.";
$xml->Titles->idSettingsMap_tip              = "Points connection algorithm. Works properly in the Edit Mode. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsRange_tip            = "Request all the points in the chosen range (in meters). This field is used to create the Permanent Link.";
$xml->Titles->idSettingsAsCamera_tip         = "Camera model within the chosen range - an arrow outside the range (in meters). This field is used to create the Permanent Link.";
$xml->Titles->idSettingsNumTextures_tip      = "Number of textures(panoramas) to buffer. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsLabels_tip           = "Show/hide distance labels. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsClosestIn2D_tip      = "Method for selecting a camera model. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsKeepZoom_tip         = "Keep zoom on window resize. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsSeeThrough_tip       = "Edit mode parameter. Visibility control of the current panorama and the previous. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsTransitionTime_tip   = "Transition time between panoramas. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsFollow_tip           = "Rotation with the camera (old heading - new heading). This field is used to create the Permanent Link.";
$xml->Titles->idSettingsMarkVisibility3d_tip = "Edit Mode Only. TBA. This field is used to create the Permanent Link.";
$xml->Titles->idSettingsPlan_tip             = "Schematic plan of the map points.";
$xml->Titles->idSettingsDotSize_tip          = "Radius of a dot on the plan.";
$xml->Titles->idSettingsThisColor_tip        = "Color of the current location dot.";
$xml->Titles->idSettingsColor_tip            = "Color of other dots.";
$xml->Titles->idSettingsSelectedColor_tip    = "Color of the selected dot.";
$xml->Titles->idSettingsGhostColor_tip       = "Color of the ghost dot.";
$xml->Titles->idSettingsInvisibleColor_tip   = "Color of the invisible dot.";


$xml->Contents->idViewMode_Controls = "
    <table style='font-size:14px'>

	<tr>
	  <td><b>1.</b></td>
	</tr>

	<tr>
	    <td colspan='2'>The page can take parameters in the following format: <b>http://address/page.html?p1=v1&p2=v2&</b>... An example with all the parameters is the 'Permanent Link'</td>
	</tr>

	<tr>
	  <td><b>2.</b></td>
	</tr>

	<tr>
	    <td>
		<b>drag</b>
	    </td>
	    <td>
		'viewer turn'(azimuth,elevation angle)
	    </td>
	 </tr>
	 <tr>
	    <td>
		<b>click</b>
	    </td>
	    <td> 
		on camera model/arrow/footprint - 'next'
	    </td>
	 </tr>
    </table>

    <table style='font-size:14px'>
	<tr>
	    <td colspan='2'>
		<b>Route navigation</b>:
	    </td>
	</tr>
	<tr>
	    <td>
		Plan points, camera models, arrows and points on the maps are clickable.
	    </td>
	</tr>
    </table>
                                      ";

$xml->Contents->idEditMode_Controls = "
     <span style='font-size:14px'>(editing technique is described at <a href='http://blog.elphel.com/2011/06/eyesis-outdoor-panorama-sets-and-the-viewereditor/'>blog.elphel.com</a>)(check the edit mode checkbox)</span>
     <table style='font-size:14px'>
	<tr><td>Horizon Alignment:</td><td></td></tr>
	<tr><td><b>drag</b></td><td>'viewer turn'(azimuth,elevation)</td></tr>
	<tr><td><b>shift+drag</b></td><td>'camera turn'(heading,tilt,roll) - correct camera orientation</td></tr>
	<tr><td><b>ctrl+click</b></td><td> on the point of interest - 'fix a rotation axis' (helps to fix one of the horizontal plane vectors and by rotating about (with <b>shift-drag</b>) it adjust the horizon)</td></tr>
	<tr><td>Location Correction:</td><td></td></tr>
	<tr><td><b>click</b></td><td>on the camera model or a point on the plan to select the camera</td></tr>
	<tr><td><b>drag</b></td><td> the red footprint to change the horizontal plane position of the selected camera</td></tr>
	<tr><td><b>ctrl+alt+drag</b></td><td> the red footprint (or check the vertical move checkbox) to change the vertical camera position</td></tr>
	<tr><td><br/>Other Edit Mode Tips:</td><td></td></tr>
	<tr><td colspan='2'>
		<b>A.</b> To create a new editable KML file choose the prototype KML file first, then fill the field <b>KML file</b> (example: 'kml_files/new-kml.kml' - editable files are stored in a subfolder <b>kml_files</b>).</br>

		</br><b>B.</b> When other camera is selected, several buttons may appear:
		<table style='font-size:14px'>
		<tr>
		    <td>1.</td><td>when 'self' is selected the only option is 'clear visibility' - make it from -infinity to +infinity</td>
		</tr>
		<tr>
		    <td>2.</td><td>when currently visible camera is selected, and it is in the segment that includes your current camera (zero) and there are <b>no</b> segments farther, the only option is 'Hide far' - make selected and all farther cameras invisible</td>
		</tr>
		<tr>
		    <td>3.</td><td>when currently visible camera is selected, and it is in the segment that includes your current camera (zero) and there <b>are some</b> segments farther, 2 options will be available - 'Hide far' (same as in (2) and 'Trim far' - hide all cameras from the selected farther until the end of the segment</td>
		</tr>
		<tr>
		    <td>4.</td><td>when currently visible camera is selected, and it is <b>not</b> in the segment that includes your current camera (zero), there are 2 options 'Hide this' and 'Hide range'. The first just hidesa that single selected camera, the second hides all currently visible range that includes it (range may include infinity)</td>
		</tr>
		<tr>
		    <td>5.</td><td>when selected camera is invisible, there are 2 options - 'Show this' and 'Show range' - works similarly to 4), just opposite - shows selected camera or whole currently invisible range</td>
		</tr>
		</table>
		<br/><b>C.</b> 'Interpolate'-button: distribute camera positions (lat, long, alt.) between the current and selected camera evenly (by time). When using that feature you need to have the current camera positions saved (using Save to KML). After the interpolation (if you are satisfied) you need to use 'Save to KML' again before moving to other spot.<br/>
		<br/><b>D.</b> 'Move'('Insert Move'). To use that feature you need to make sure that all the map is requested (put sufficiently large &range=). This function is needed if you need to move many cameras together, insert vector between to camera spots. You can select and move some camera, and while it is still selected (do not press 'Save to KML'!) press 'Insert Move'. It will apply the movement vector that the selected camera was moved (difference between the red one and the 'ghost' one) to the selected camera and l the cameras that are farther (in the sense of the sequence number, time) than it. The cameras between current and selected (if there are any ) will be interpolated, the current cameras and all that are 'behind it' (sequence numbers/time in the opposite direction than the selected) remain unchanged. If you are satisfied with the results - 'Save to KML'.
	    </td>
	</tr>
     </table>
                                      ";

sendResponse($xml);

function sendResponse($xml){
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($xml->asXML())."\n");
    header("Pragma: no-cache\n");
    echo $xml->asXML();
}

?>