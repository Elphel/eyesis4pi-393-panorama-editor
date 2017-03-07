<?php
/********************************************************************************
*! FILE NAME  : pano_db_inerface.php
*! DESCRIPTION: interface with the db
*! VERSION:     1.0
*! AUTHOR:      Sebastian Pichelhofer, Oleg Dzhimiev <oleg@elphel.com>
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
*!  $Log: pano_db_inerface.php,v $
*!
*/

//require_once("call_filter.php");

include("pano_db_functions.php");

if (isset($_GET['cmd'])) $cmd = $_GET['cmd'];
else                     die("Error Code: 13542");

$skip_db = ConnectMySQL();

$xml = @simplexml_load_file("php://input");

if ($xml) {
    //pay attention to the command.
    if (($cmd=="AddNode") || ($cmd=="UpdateNode")) {
      $xml_nodes = $xml->PhotoOverlay;
    }else{
      $xml_nodes = $xml->node; //array of records
    }
}

switch ($cmd) {
	case "AddRoute"   :
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = AddRoute($xml_nodes[$i]->name,$xml_nodes[$i]->description);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "UpdateRoute": 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  //send_response(AddRoute($xml_nodes));
		  $response[$i] = UpdateRoute($xml_nodes[$i]->ID,$xml_nodes[$i]->name,$xml_nodes[$i]->description);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetNodesByRoute":
	      $Nodes = GetNodesByRoute($xml_nodes[0]->ID);
	      $kml = "";

	      if (isset($Nodes['error'])) {
		  send_response("<?xml version=\"1.0\"?>\n<result><node><error>".$Nodes['error']."</error></node></result>");
		  break;
	      }

	      foreach ($Nodes as $Node) {
		    if (!isset($Node['error'])) $kml .= CreateKMLEntry($Node);
		    else {
		      send_response(CreateXMLStringFromArray($Node['error']));
		      break;
		    }
	      }
	      if ($kml!="") PrintKML($kml);
	      else          send_response("<?xml version=\"1.0\"?>\n<result><node><error>Some error, no apologies</error></node></result>");

  // 			else if ($Args['return'] == "JSON") {
  // 			    $return = GetNodesByRoute($Args['parameters']['ID']);
  // 			    $output = $json->encode($return);
  // 			    print($output);
  // 			}
	break;
	case "DeleteRoute" : 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = DeleteRoute($xml_nodes[$i]->ID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetRouteData": 
	      //send_response(GetRouteData($xml_nodes)); 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = GetRouteData($xml_nodes[$i]->ID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetRoutes"          : send_response(GetRoutes()); break;
	case "GetRoutesAndKMLs"   : send_response(GetRoutesAndKMLs($skip_db)); break;
	case "GetNodeCount": 
	    if ($xml_nodes[0]->ID=="") {
		  $response[0]['id'] = "N/A";
		  $response[0]['total'] = GetNodeCount($xml_nodes[0]->ID);
	    }else{
	      for($i=0;$i<count($xml_nodes);$i++){
		  $response[$i]['id'] = $xml_nodes[$i]->ID;
		  $response[$i]['N'] = GetNodeCount($xml_nodes[$i]->ID);
	      }
	    }

	    send_response(CreateXMLStringFromArray($response));
	break;
	case "AddNode": 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = AddNode(KMLRecord2Array($xml_nodes[$i]));
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetNodeData": 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = GetNodeData($xml_nodes[$i]->ID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "UpdateNode": 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = UpdateNode(KMLRecord2Array($xml_nodes[$i]));
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "DeleteNode": 
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = DeleteNode($xml_nodes[$i]->ID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "AddNodeToRoute":
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = AddNodeToRoute($xml_nodes[$i]->NodeID,$xml_nodes[$i]->RouteID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "RemoveNodeFromRoute":
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = RemoveNodeFromRoute($xml_nodes[$i]->NodeID,$xml_nodes[$i]->RouteID);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetNodeIDbyImageFileName":
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = GetNodeIDbyImageFileName($xml_nodes[$i]->RouteID,$xml_nodes[$i]->href);
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetNodesAt":
	      //for($i=0;$i<count($xml_nodes);$i++) {
		  $response = GetNodesAt(
		      $xml_nodes[0]->latmin,
		      $xml_nodes[0]->latmax,
		      $xml_nodes[0]->lonmin,
		      $xml_nodes[0]->lonmax,
		      $xml_nodes[0]->limit
		  );
	      //}
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetNodesDistance":
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = GetNodesDistance(
		      $xml_nodes[$i]->ID1,
		      $xml_nodes[$i]->ID2
		  );
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "GetRouteBounds":
	      for($i=0;$i<count($xml_nodes);$i++) {
		  $response[$i] = GetRouteBounds(
		      $xml_nodes[$i]->ID
		  );
	      }
	      send_response(CreateXMLStringFromArray($response));
	break;
	case "ImportKML":
	      //for($i=0;$i<count($xml_nodes);$i++) {
		  $response = ImportKML(
		      $xml_nodes[0]->path,
		      $xml_nodes[0]->RouteID,
		      $xml_nodes[0]->overwrite
		  );
	      //}
	      send_response(CreateXMLStringFromArray($response));
	break;
}

function KMLRecord2Array($rec){
	if (isset($rec->ID  ))        $data['ID']         = $rec->ID;
	if (isset($rec->name))        $data['Name']       = $rec->name;
	if (isset($rec->Description)) $data['Description']= $rec->Description;

	if (isset($rec->ExtendedData->OriginalData->longitude)) $data['OriginalDataLongitude']= $rec->ExtendedData->OriginalData->longitude;

	if (isset($rec->ExtendedData->OriginalData->latitude)) $data['OriginalDataLatitude']  = $rec->ExtendedData->OriginalData->latitude;
	if (isset($rec->ExtendedData->OriginalData->altitude)) $data['OriginalDataAltitude']  = $rec->ExtendedData->OriginalData->altitude;
	if (isset($rec->ExtendedData->OriginalData->heading)) $data['OriginalDataHeading']   = $rec->ExtendedData->OriginalData->heading;
	if (isset($rec->ExtendedData->OriginalData->tilt)) $data['OriginalDataTilt']      = $rec->ExtendedData->OriginalData->tilt;
	if (isset($rec->ExtendedData->OriginalData->roll)) $data['OriginalDataRoll']      = $rec->ExtendedData->OriginalData->roll;
	if (isset($rec->Camera->longitude)) $data['Longitude'] = $rec->Camera->longitude;
	if (isset($rec->Camera->latitude)) $data['Latitude']              = $rec->Camera->latitude;
	if (isset($rec->Timestamp->when)) $data['Timestamp']             = $rec->Timestamp->when;
	//$data['TimeStampMilliseconds'] = (isset($rec->))?$rec->:0;
	if (isset($rec->Camera->altitude)) $data['Altitude']              = $rec->Camera->altitude;
	if (isset($rec->Camera->heading)) $data['Heading']               = $rec->Camera->heading;
	if (isset($rec->Camera->tilt)) $data['Tilt']                  = $rec->Camera->tilt;
	if (isset($rec->Camera->roll)) $data['Roll']                  = $rec->Camera->roll;
	if (isset($rec->Icon->href)) $data['PanoramaURL']           = $rec->Icon->href;
	if (isset($rec->visibility)) $data['Visibility3D']          = $rec->visibility;
	return $data;
}

function send_response($content) {
	header("Content-Type: text/xml\n");
	header("Content-Length: ".strlen($content)."\n");
	header("Pragma: no-cache\n");
	echo $content;
}


?>