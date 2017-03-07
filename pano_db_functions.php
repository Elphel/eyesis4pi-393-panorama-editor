<?php
/********************************************************************************
*! FILE NAME  : pano_db_functions.php
*! DESCRIPTION: functions for the db
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
*!  $Log: pano_db_functions.php,v $
*!
*/

function ConnectMySQL () {
	$sql_host		=	'localhost';
	$sql_db			=	'';
	$sql_user		=	'';
	$sql_pass		=	'';

	$con = mysql_connect("$sql_host","$sql_user","$sql_pass");
	
	if ($con) {
          //skip

          $db = mysql_select_db("$sql_db",$con);
          if (!$db){
            //die ("Cannot select the $sql_db database.<br />Please check your details in the database connection  file and try again");
            return false;
          }else{
            return true;
          }
        }else{
          //die ("Cannot connect to MySql.");
          return false;
        }

}


// Save a new route to the DB supplying all database field as array
/*
xml array fields are:
$nodes[$i]->name
$nodes[$i]->description
*/
function AddRoute ($name,$description) {
	    $return['name'] = $name;
	    // check if the route already exists
	    $sqlq = "SELECT * FROM routes WHERE Name = '".$name."' AND Description = '".$description."'";
	    $result = mysql_query($sqlq) or die("Database error <br />" . mysql_error()); // why die()?
	    $entries = mysql_num_rows($result);
	    if (!$entries) {
		$sqlq = "INSERT INTO routes (Name, Description) VALUES ('".$name."', '".($description)."')";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$return['id'] = mysql_insert_id();
	    } else {
		 $return['error'] = "Entry already exists";
	    }
	return $return;
}

// Update a Route - overwrite field with values provided as parameter array
// ID field is mandatory
function UpdateRoute($id,$name=null,$description=null) {
		$return['ID'] = $id;
		// check if the Route exists
		$sqlq = "SELECT * FROM routes WHERE ID = '".$id."'";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$exists = mysql_fetch_array($result, MYSQL_BOTH);
		if ($exists['ID'] != "") { // does it exist?
			$values = "";
			if (isset($name)) {
				$values .= "`Name`='".$name."', ";
			}
			if (isset($description)) {
				$values .= "Description='".$description."', ";
			}

			$values = substr($values, 0, strlen($values)-2); // get rid of last ','

			$sqlq = "UPDATE routes SET ".$values." WHERE ID = '".($id)."'";
			$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());

			$return['success'] = "congrats";
		} else {
			$return['error'] = "Route with ID: ".($id)." not found";
		}

	return $return;
}

// Returns all Nodes associated with a Route
function GetNodesByRoute ($id) {

		// Check if Route with $RouteID exists before continuing
		$sqlq = "SELECT * FROM routes WHERE ID = '".$id."'";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$exists = mysql_fetch_array($result, MYSQL_BOTH);
		if ($exists['ID'] == "") {
			$return['error'] = "Route with ID=".$id." not found";
			return $return;
		} 

		$index = 0;
		$sqlq = "SELECT * FROM nodes LEFT JOIN routes_nodes ON nodes.ID = routes_nodes.NodeID WHERE routes_nodes.RouteID = '".$id."' ORDER BY `routes_nodes`.`Order` ASC";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());

		while($rows = mysql_fetch_array($result, MYSQL_BOTH)) {
			$return[$index]['ID'] = $rows['ID'];
			$return[$index]['Order'] = $rows['Order'];
			$return[$index]['Name'] = $rows['Name'];
			$return[$index]['Description'] = $rows['Description'];
			$return[$index]['OriginalDataLongitude'] = $rows['OriginalDataLongitude'];
			$return[$index]['OriginalDataLatitude'] = $rows['OriginalDataLatitude'];
			$return[$index]['OriginalDataAltitude'] = $rows['OriginalDataAltitude'];
			$return[$index]['OriginalDataHeading'] = $rows['OriginalDataHeading'];
			$return[$index]['OriginalDataTilt'] = $rows['OriginalDataTilt'];
			$return[$index]['OriginalDataRoll'] = $rows['OriginalDataRoll'];
			$return[$index]['Longitude'] = $rows['Longitude'];
			$return[$index]['Latitude'] = $rows['Latitude'];
			$return[$index]['Timestamp'] = $rows['Timestamp'];
			$return[$index]['TimeStampMilliseconds'] = $rows['TimeStampMilliseconds'];
			$return[$index]['Altitude'] = $rows['Altitude'];
			$return[$index]['Heading'] = $rows['Heading'];
			$return[$index]['Tilt'] = $rows['Tilt'];
			$return[$index]['Roll'] = $rows['Roll'];
			$return[$index]['PanoramaURL'] = $rows['PanoramaURL'];
			$return[$index]['Visibility3D'] = $rows['Visibility3D'];
			$index++;
		}

		if ($index==0) {
		$return['error'] = "Route with the ID=".$id." is empty ";
		}

	return $return;
}

function DeleteRoute($id) {
		// check if a Route with the provided $RouteID exists
		$return['id'] = $id;
		$sqlq = "SELECT * FROM routes WHERE ID = '".$id."'";
		$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$routeexists = mysql_num_rows($results);
		$nodes_count = 0;
		if ($routeexists) {
			// also delete all nodes that the route contains
			$nodes = GetNodesByRoute($id);
			if (!isset($nodes['error'])) {
				foreach ($nodes as $node) {
					// delete nodes associated with this route
					$sqlq = "DELETE FROM nodes WHERE ID = '".$node['ID']."'";
					$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
					$nodes_count++;
				}

				// delete route
				$sqlq = "DELETE FROM routes WHERE ID = '".$id."'";
				$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());

				// delete route-node relationship
				// do this at last or otherwise we don't know which nodes belong to which route anymore
				$sqlq = "DELETE FROM routes_nodes WHERE RouteID = '".$id."'";
				$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
			}else{
				//$return[$i]['fail'] = "check1";
				// delete route
				$sqlq = "DELETE FROM routes WHERE ID = '".$id."'";
				$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());

				// delete route-node relationship
				// do this at last or otherwise we don't know which nodes belong to which route anymore
				$sqlq = "DELETE FROM routes_nodes WHERE RouteID = '".$id."'";
				$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
			}
			$return['success'] = "congrats";
			$return['entries'] = $nodes_count;
			
		} else {
			$return['error'] = "Route with ID=".$id." does not exist";
		}

	return $return;

}

// Returns all database fields of a specific Route ID as array 
function GetRouteData ($id) {
	$sqlq = "SELECT * FROM routes WHERE ID = '".$id."'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_fetch_array($result, MYSQL_BOTH);
	if ($exists['ID'] != "") {
		$return['ID'] = $exists['ID'];
		$return['Name'] = $exists['Name'];
		$return['Description'] = $exists['Description'];
	} else {
		$return['error'] = "ID ".$id." not found";
	}
	return $return;
}

// Returns all Routes with Nodes associated and the location of their first Node
function GetRoutes () {

	//$sqlq = "SELECT * FROM nodes LEFT JOIN routes_nodes ON nodes.ID = routes_nodes.NodeID LEFT JOIN routes ON routes.ID = routes_nodes.RouteID WHERE routes_nodes.Order = '1'";

	$sqlq = "SELECT * FROM routes";

	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$index = 0;
	while($rows = mysql_fetch_array($result, MYSQL_BOTH)) {
		$return[$index]['ID'] = $rows['ID'];
		$return[$index]['Name'] = $rows['Name'];
		$return[$index]['Description'] = $rows['Description'];
		//$return[$index]['Latitude'] = $rows['Latitude'];
		//$return[$index]['Longitude'] = $rows['Longitude'];
		$return[$index]['Nodes'] = GetNodeCount($rows['ID']);
		$index++;
	}

	if ($index==0) $return[0]['error']="No routes found";

	return CreateXMLStringFromArray($return);
}

// Returns all Routes with Nodes associated and the location of their first Node
function GetRoutesAndKMLs ($skip_db) {

	//$sqlq = "SELECT * FROM nodes LEFT JOIN routes_nodes ON nodes.ID = routes_nodes.NodeID LEFT JOIN routes ON routes.ID = routes_nodes.RouteID WHERE routes_nodes.Order = '1'";

        $index = 0;
	
	if ($skip_db){

          $sqlq = "SELECT * FROM routes";

          $result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
          
          while($rows = mysql_fetch_array($result, MYSQL_BOTH)) {
                  $return[$index]['ID'] = $rows['ID'];
                  $return[$index]['Name'] = $rows['Name'];
                  $return[$index]['Description'] = $rows['Description'];
                  //$return[$index]['Latitude'] = $rows['Latitude'];
                  //$return[$index]['Longitude'] = $rows['Longitude'];
                  $return[$index]['Nodes'] = GetNodeCount($rows['ID']);
                  $index++;
          }

	}
	
	$result_files = search_kmls();
	for ($i=0;$i<count($result_files);$i++){
	    $return[$index]['ID'] = $result_files[$i]['Name'];
	    $return[$index]['Editable'] = $result_files[$i]['Editable'];
	    $return[$index]['Nodes'] = $result_files[$i]['Nodes'];
	    $index++;
	}

	if ($index==0) $return[0]['error']="No routes found";

	return CreateXMLStringFromArray($return);
}

function search_kmls(){
    $index = 0;
    $tmp_list = scandir("kml_files");
    foreach($tmp_list as $some_file) {
	$info = pathinfo("kml_files/".$some_file);
	if ($info['extension']=="kml") {
	    $result[$index]['Name'] = $some_file;
	    if (is__writable("kml_files/".$some_file)) $result[$index]['Editable'] = "Yes";
	    else                         $result[$index]['Editable'] = "No";

	    $result[$index]['Nodes'] = get_number_of_nodes_in_kml_file("kml_files/".$some_file);

	    $index++;
	}
    }
    return $result;
}

function get_number_of_nodes_in_kml_file($file){
      $tmp_xml = simplexml_load_file($file);
      $nodes = $tmp_xml->children()->children();
      return count($nodes);
}

// Returns the number of Nodes currently stored in the DB
// If you supply a RouteID you can get the number of nodes associated with a specific route.

function GetNodeCount($id) {
	if ($id=="") {
		    $sqlq = "SELECT * FROM nodes";
		    $result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		    $return = mysql_num_rows($result);
	}else{
		$sqlq = "SELECT * FROM routes_nodes WHERE RouteID = '".$id."'";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$return = mysql_num_rows($result);
	    }
	return $return;
}


// Save a new node to the DB supplying all database field as array:
/*
Array fields are:
$data['Name'],
$data['Description'],
$data['OriginalDataLongitude'],
$data['OriginalDataLatitude'],
$data['OriginalDataAltitude'],
$data['OriginalDataHeading'],
$data['OriginalDataTilt'],
$data['OriginalDataRoll'],
$data['Longitude'],
$data['Latitude'],
$data['Timestamp'],
$data['TimeStampMilliseconds'],
$data['Altitude'],
$data['Heading'],
$data['Tilt'],
$data['Roll'],
$data['PanoramaURL'],
$data['Visibility3D']
*/
function AddNode ($ArrayData) {
	/*
	$sqlq = "SELECT * FROM nodes WHERE OriginalDataLongitude = '".$ArrayData['OriginalDataLongitude']."' AND OriginalDataLatitude = ".$ArrayData['OriginalDataLatitude']." AND OriginalDataLatitude = ".$ArrayData['OriginalDataAltitude'];
	*/

	//override... panoramaurl is unique for now
	$sqlq = "SELECT * FROM nodes WHERE PanoramaURL = '".$ArrayData['PanoramaURL']."'";

	$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_num_rows($results);

	if (!$exists) {
		/*
		$sqlq = "INSERT INTO nodes (Name, Description, OriginalDataLongitude, OriginalDataLatitude, OriginalDataAltitude,
			OriginalDataHeading, OriginalDataTilt, OriginalDataRoll, Longitude, Latitude, Timestamp,
			TimeStampMilliseconds, Altitude, Heading, Tilt, Roll, PanoramaURL, Visibility3D)
			VALUES
			('".$ArrayData['Name']."', '".$ArrayData['Description']."', '".$ArrayData['OriginalDataLongitude']."',
			'".$ArrayData['OriginalDataLatitude']."', '".$ArrayData['OriginalDataAltitude']."', '".$ArrayData['OriginalDataHeading']."',
			'".$ArrayData['OriginalDataTilt']."', '".$ArrayData['OriginalDataRoll']."', '".$ArrayData['Longitude']."', '".$ArrayData['Latitude']."',
			'".$ArrayData['Timestamp']."', '".$ArrayData['TimeStampMilliseconds']."', '".$ArrayData['Altitude']."', '".$ArrayData['Heading']."',
			'".$ArrayData['Tilt']."', '".$ArrayData['Roll']."', '".$ArrayData['PanoramaURL']."', '".$ArrayData['Visibility3D']."')";
		*/

		$string_keys = "";
		$string_values = "";

		foreach ($ArrayData as $key=>$val) {
		    $string_keys .= $key.", ";
		    $string_values .= "'$val', ";
		}
		$string_keys = substr($string_keys,0,-2);
		$string_values = substr($string_values,0,-2);

		$sqlq = "INSERT INTO nodes ($string_keys) VALUES ($string_values)";

		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$return['id'] = mysql_insert_id();
	} else {
		 $return['error'] = "Entry with exactly the same coordinates already exists";
		 //get id
		 $exists = mysql_fetch_array($results, MYSQL_BOTH);
		 $return['id'] = $exists['ID'];
	}
	return $return;
}

// Returns all database fields of a specific Node with ID as array
function GetNodeData ($ID) {
	$sqlq = "SELECT * FROM nodes WHERE ID = '$ID'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_fetch_array($result, MYSQL_BOTH);
	if ($exists['ID'] != "") { // does it exist?
		$return['ID'] = $exists['ID'];
		$return['Name'] = $exists['Name'];
		$return['Description'] = $exists['Description'];
		$return['OriginalDataLongitude'] = $exists['OriginalDataLongitude'];
		$return['OriginalDataLatitude'] = $exists['OriginalDataLatitude'];
		$return['OriginalDataAltitude'] = $exists['OriginalDataAltitude'];
		$return['OriginalDataHeading'] = $exists['OriginalDataHeading'];
		$return['OriginalDataTilt'] = $exists['OriginalDataTilt'];
		$return['OriginalDataRoll'] = $exists['OriginalDataRoll'];
		$return['Longitude'] = $exists['Longitude'];
		$return['Latitude'] = $exists['Latitude'];
		$return['Timestamp'] = $exists['Timestamp'];
		$return['TimeStampMilliseconds'] = $exists['TimeStampMilliseconds'];
		$return['Altitude'] = $exists['Altitude'];
		$return['Heading'] = $exists['Heading'];
		$return['Tilt'] = $exists['Tilt'];
		$return['Roll'] = $exists['Roll'];
		$return['PanoramaURL'] = $exists['PanoramaURL'];
		$return['Visibility3D'] = $exists['Visibility3D'];
	} else {
		$return['error'] = "ID not found";
	}
	return $return;
}

// Update a Node - overwrite field with values provided as parameter array, fields like "OriginalDataLongitude" cannot be overwritten
// ID field is mandatory
function UpdateNode($Parameters) {
	// check if the node exists 
	$return['id'] = $Parameters['ID'];
	$sqlq = "SELECT * FROM nodes WHERE ID = '".$Parameters['ID']."'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_fetch_array($result, MYSQL_BOTH);
	if ($exists['ID'] != "") { // does it exist?
		$values = "";
		
		foreach ($Parameters as $key=>$val) {
		    $values .= "$key = '$val', ";
		}
		$values = substr($values,0,-2);
		
		$sqlq = "UPDATE nodes SET ".$values." WHERE ID = '".$Parameters['ID']."'";
		$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		
		$return['success'] = "congrats";
	} else {
		$return['error'] = "Node with ID: ".$Parameters['ID']." not found";
	}
	return $return;
}

// Add a node to a specific route supplying both IDs
function AddNodeToRoute ($NodeID, $RouteID) {
	// check if the entry we are trying to add does not exist already
	$sqlq = "SELECT * FROM routes_nodes WHERE RouteID = '$RouteID' AND NodeID = '$NodeID'";
	$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_num_rows($results);
	if (!$exists) {
		// check if a node with the provided $NodeID exists
		$sqlq = "SELECT * FROM nodes WHERE ID = '$NodeID'";
		$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$nodeexists = mysql_num_rows($results);
		if ($nodeexists) {
			// check if a route with the provided $RouteID exists
			$sqlq = "SELECT * FROM routes WHERE ID = '$RouteID'";
			$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
			$routeexists = mysql_num_rows($results);
			if ($routeexists) {
				$Order_Value = GetNodeCount($RouteID) + 1; // order is just incremented with every new entry for now
				
				// all checks pass, now add the actual entry
				$sqlq = "INSERT INTO routes_nodes (`RouteID`, `NodeID`, `Order`) VALUES ('".$RouteID."', '".$NodeID."', '".$Order_Value."')";
				$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
				$return['success'] = "congrats";
			} else {
				$return['error'] = "Route with supplied ID does not exist";
			}
		} else {
			$return['error'] = "Node with supplied ID does not exist: ".$NodeID;
		}
	} else {
		 $return['error'] = "Entry already exists";
	}
	return $return;
}

function DeleteNode($NodeID) {
	// check if a Node with the provided $NodeID exists
	$sqlq = "SELECT * FROM nodes WHERE ID = '$NodeID'";
	$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$nodeexists = mysql_num_rows($results);
	if ($nodeexists) {
		$sqlq = "DELETE FROM nodes WHERE ID = '$NodeID'";
		$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());

		$sqlq = "DELETE FROM routes_nodes WHERE NodeID = '$NodeID'";
		$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		
		$return['success'] = "congrats";
	} else {
		$return['error'] = "Entry with NodeID: ".$NodeID." does not exist";
	}
	return $return;
}

function RemoveNodeFromRoute($NodeID, $RouteID) {
	// since this is intended for clean up don't check if the Node or Route we aim to delete still exists
	// just check if the entry we want to delete is not already gone
	$sqlq = "SELECT * FROM routes_nodes WHERE RouteID = '$RouteID' AND NodeID = '$NodeID'";
	$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$entryexists = mysql_num_rows($results);
	if ($entryexists) {
		$sqlq = "DELETE FROM routes_nodes WHERE RouteID = '$RouteID' AND NodeID = '$NodeID'";
		$results = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
		$return['success'] = "done";
	} else {
		$return['error'] = "Entry with NodeID: ".$NodeID." and RouteID: ".$RouteID." does not exist";
	}
	return $return;
}

function GetNodeIDbyImageFileName($RouteID, $Filename) {
	$sqlq = "SELECT * FROM nodes LEFT JOIN routes_nodes ON nodes.ID = routes_nodes.NodeID WHERE routes_nodes.RouteID = '$RouteID' AND PanoramaURL LIKE '%$Filename%'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_fetch_array($result, MYSQL_BOTH);
	if ($exists['ID'] != "") { // does it exist?
		$return['id'] = $exists['ID'];
	} else {
		$return['error'] = "no results";
	}
	return $return;
}

// Find an array of nodes that are in the area of the supplied coordinates (LatMin, LatMax, LongMin, LongMax).
// To prevent a huge number of results there is the limit parameter with a default value of 100.
// the results are not returned in a particular order
function GetNodesAt ($LatMin, $LatMax, $LongMin, $LongMax, $Limit = 100) {
	// prevent zero results of min and max are swapped
	if ($LatMin >= $LatMax) {
		$helper = $LatMin;
		$LatMin = $LatMax-0.0000000001;
		$LatMax = $helper+0.0000000001;
	}
	if ($LongMin >= $LongMax) {
		$helper = $LongMin;
		$LongMin = $LongMax-0.0000000001;
		$LongMax = $helper+0.0000000001;
	}

	// SQL BETWEEN statement can't deal with negative values so we do it this way
	$sqlq = "SELECT * FROM nodes WHERE Latitude >= '$LatMin' AND Latitude <= '$LatMax' AND Longitude >= '$LongMin' AND Longitude <= '$LongMax'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$i = 0;
	while ($exists = mysql_fetch_array($result, MYSQL_BOTH)) {
		if ($i > $Limit)
			break;
		if ($exists['ID'] != "") { // does it exist?
			$return[$i]['ID'] = $exists['ID'];
			$return[$i]['Name'] = $exists['Name'];
			$return[$i]['Description'] = $exists['Description'];
			$return[$i]['OriginalDataLongitude'] = $exists['OriginalDataLongitude'];
			$return[$i]['OriginalDataLatitude'] = $exists['OriginalDataLatitude'];
			$return[$i]['OriginalDataAltitude'] = $exists['OriginalDataAltitude'];
			$return[$i]['OriginalDataHeading'] = $exists['OriginalDataHeading'];
			$return[$i]['OriginalDataTilt'] = $exists['OriginalDataTilt'];
			$return[$i]['OriginalDataRoll'] = $exists['OriginalDataRoll'];
			$return[$i]['Longitude'] = $exists['Longitude'];
			$return[$i]['Latitude'] = $exists['Latitude'];
			$return[$i]['Timestamp'] = $exists['Timestamp'];
			$return[$i]['TimeStampMilliseconds'] = $exists['TimeStampMilliseconds'];
			$return[$i]['Altitude'] = $exists['Altitude'];
			$return[$i]['Heading'] = $exists['Heading'];
			$return[$i]['Tilt'] = $exists['Tilt'];
			$return[$i]['Roll'] = $exists['Roll'];
			$return[$i]['PanoramaURL'] = $exists['PanoramaURL'];
			$return[$i]['Visibility3D'] = $exists['Visibility3D'];
			$i++;
		}
	}
	return $return;
}

function GetNodesDistance ($Node1ID, $Node2ID) {
	// we assume that the 2 nodes have no big altitude difference and calculate the distance based on their longitude and latitude on the earth sphere surface
	$continue = true;
	
	$node1 = GetNodeData($Node1ID);
	if (isset($node1['error'])) {
		$return['error'] = "Node 1: ".$node1['error'];
		$continue = false;
	}
	
	$node2 = GetNodeData($Node2ID);
	if (isset($node2['error'])) {
		$return['error'] = "Node 2: ".$node2['error'];
		$continue = false;
	}

	if ($continue) {
		$earthRadius = 6378100; //meters
		$delta_Latitude = $node2['Latitude'] - $node1['Latitude'];
		$delta_Longitude  = $node2['Longitude']- $node1['Longitude'];
		$lat = ($node2['Latitude'] + $node1['Latitude']) / 2;
		$dlong*= cos(deg2rad($lat));
	
		$return['distance'] = pi() * $earthRadius / 180 * sqrt($delta_Latitude * $delta_Latitude + $delta_Longitude * $delta_Longitude);
	} else {
		//return $return;
	}

	return $return;
}

// Returns 2 Long/Lat pairs defining the rectangular bounds of this Route
function GetRouteBounds ($RouteID) {
	// Check if Route with $RouteID exists before continuing
	$sqlq = "SELECT * FROM routes WHERE ID = '$RouteID'";
	$result = mysql_query($sqlq) or die("Database error <br />" . mysql_error());
	$exists = mysql_fetch_array($result, MYSQL_BOTH);
	if ($exists['ID'] == "") {
		$return['error'] = "Route with ID: ".$RouteID." not found";
		return $return;
	} 
	$MinLong = 180;
	$MaxLong = -180;
	$MinLat = 90;
	$MaxLat = -90;

	// Load all Nodes from this Route
	$Nodes = GetNodesByRoute($RouteID);
	
	if (isset($Nodes['error'])) {
		$return['error'] = $Nodes['error'];
	}else{
	    // Find Min/Max
	    for ($i = 0; $i < count($Nodes);$i++) {

		    if ($Nodes[$i]['Latitude'] > $MaxLat) {
			    $MaxLat = $Nodes[$i]['Latitude'];
		    }
		    if ($Nodes[$i]['Latitude'] < $MinLat) {
			    $MinLat = $Nodes[$i]['Latitude'];
		    }

		    if ($Nodes[$i]['Longitude'] > $MaxLong) {
			    $MaxLong = $Nodes[$i]['Longitude'];
		    }
		    if ($Nodes[$i]['Longitude'] < $MinLong) {
			    $MinLong = $Nodes[$i]['Longitude'];
		    }
	    }
	    $return['MinLatitude'] = $MinLat;
	    $return['MaxLatitude'] = $MaxLat;
	    $return['MinLongitude'] = $MinLong;
	    $return['MaxLongitude'] = $MaxLong;
	    $return['CenterLatitude'] = $MinLat + ($MaxLat - $MinLat) / 2;
	    $return['CenterLongitude'] = $MinLong + ($MaxLong - $MinLong) / 2;
	}

	return $return;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Works just like AddNode but can import a high number of nodes with a single function - read from a KML file or KML String (if file is not found), if you supply a RouteID all new Nodes will automatically be added to an existing route.
function ImportKML ($KMLfile, $RouteID, $overwrite=false) {
	$entries = 0;
	
	if ($overwrite=="false") $overwrite = false;

	$overwrite = true;

	if (file_exists("kml_files/".$KMLfile)) {
		$xml = simplexml_load_file("kml_files/".$KMLfile);
 	/*
	else {
		$xml = simplexml_load_string(html_entity_decode($KMLfile));
	}
	*/
	foreach($xml->children()->children() as $child) {
		// Loop through every panorama entry

		//<PhotoOverlay id="12"> <- extract ID from this tag
		if (isset($child->attributes()->id)) {
			$data['ID'] = $child->attributes()->id;
			$return['attention'] = $data['ID'];
		}
		/*
		<Camera>
			<longitude>-110.69838765920252</longitude>
			<latitude>38.56224631822149</latitude>
			<altitude>1429.72</altitude>
			<heading>272.677574682831</heading>
			<tilt>85.71949990886216</tilt>
			<roll>10.35173368362165</roll>
		</Camera>
		<ExtendedData>
			<OriginalData>
				<longitude>-110.698398</longitude>
				<latitude>38.562215</latitude>
				<altitude>1430.6</altitude>
				<heading>0</heading>
			</OriginalData>
		</ExtendedData>
		*/
		
		$data['Longitude'] = (string)$child->Camera->longitude;
		if (isset($child->ExtendedData->OriginalData->longitude))
			$data['OriginalDataLongitude'] = (string)$child->ExtendedData->OriginalData->longitude;
		else
			$data['OriginalDataLongitude'] = $data['Longitude'];
		
		$data['Latitude'] = (string)$child->Camera->latitude;
		if (isset($child->ExtendedData->OriginalData->latitude))
			$data['OriginalDataLatitude'] = (string)$child->ExtendedData->OriginalData->latitude;
		else
			$data['OriginalDataLatitude'] = $data['Latitude'];
		
		
		$data['Altitude'] = (string)$child->Camera->altitude;
		if (isset($child->ExtendedData->OriginalData->altitude))
			$data['OriginalDataAltitude'] = (string)$child->ExtendedData->OriginalData->altitude;
		else
			$data['OriginalDataAltitude'] = $data['Altitude'];
		
		
		$data['Heading'] =(string)$child->Camera->heading;
		if (isset($child->ExtendedData->OriginalData->heading))
			$data['OriginalDataHeading'] = (string)$child->ExtendedData->OriginalData->heading;
		else
			$data['OriginalDataHeading'] = $data['Heading'];
		
		
		$data['Tilt'] = (string)$child->Camera->tilt;
		if (isset($child->ExtendedData->OriginalData->tilt))
			$data['OriginalDataTilt'] = (string)$child->ExtendedData->OriginalData->tilt;
		else
			$data['OriginalDataTilt'] = $data['Tilt'];
		
		
		$data['Roll'] = (string)$child->Camera->roll;
		if (isset($child->ExtendedData->OriginalData->roll))
			$data['OriginalDataRoll'] = (string)$child->ExtendedData->OriginalData->roll;
		else
			$data['OriginalDataRoll'] = $data['Roll'];
		

		/*
		<TimeStamp>
			<when>2011-06-18T20:09:52.901982Z</when>
		</TimeStamp>
		*/
		$temp = (string)$child->TimeStamp->when;
		
		$data['Timestamp'] = substr($temp, 0, strpos($temp, "."));
		$data['TimeStampMilliseconds'] =  substr($temp, strpos($temp, ".") + 1, strlen($temp) - 1);


		/*
		<Icon>
			<href>http://community.elphel.com/files/eyesis/webgl-pano/3/panos_gv/result_1303513568_466930-000001.jpeg</href>
		</Icon>
		*/
		$data['PanoramaURL'] = (string)$child->Icon->href;

		
		/*
		<description>undefined</description>
		<name>1</name>
		*/
		$data['Name'] = (string)$child->name;
		if ($child->description == "undefined") {
			$data['Description'] = "";
		} else {
			$data['Description'] = (string)$child->description;
		}
		
		
		/*
		<Visibility3d>
			<v3Range>
				<to>6</to>
			</v3Range>
			<v3Range>
				<from>21</from><to>21</to>
			</v3Range>
			<v3Range>
				<from>24</from><to>25</to>
			</v3Range>
			<v3Range>
				<from>27</from><to>41</to>
			</v3Range>
		</Visibility3d>
		Lets transform this into a single string with "-" as "from to" and "|" as divider
		-> "-6|21-21|24-25|27-41|"
		*/
		$data['Visibility3D'] = "";
		if (isset($child->ExtendedData->Visibility3d)) {
			foreach($child->ExtendedData->Visibility3d->v3Range as $v3Range) {
				if(isset($v3Range->from)) {
					$data['Visibility3D'] .= $v3Range->from."-".$v3Range->to."|";
				} else {
					$data['Visibility3D'] .= "-".$v3Range->to."|";
				}
			}
		}

		$NodeID = AddNode($data);

		if (isset($NodeID['error'])) {
		    if ($overwrite) UpdateNode($data);
		}

		if (isset($RouteID)) {
			$return[$entries] = AddNodeToRoute ($NodeID['id'], $RouteID);
			if (isset($return[$entries]['error'])) {
			    $return[$entries]['failure'] = "condolences";
			}else{
			    $return[$entries]['success'] = "congrats";
			}
		}

		//print_r ($data);
// 		if ($overwrite) {
// 			UpdateNode($data);
// 			$return['AddNodeToRoute'] = AddNodeToRoute ($NodeID['id'], $RouteID);
// 			$return[$entries]['success'] = "congrats";
// 		} else {
// 			$NodeID = AddNode($data);
// 			if (isset($RouteID)) {
// 				if (!isset($NodeID['error'])) {
// 					$return['AddNodeToRoute'] = AddNodeToRoute ($NodeID['id'], $RouteID);
// 					$return[$entries]['success'] = "congrats";
// 				}else{
// 					$return[$entries]['error'] = "Already exists";
// 				}
// 			}
// 		}
		$entries++;
	}
	$return[0]['Entries'] = $entries;

	}else{
	      $return[0]['error'] = "No such file";
	}

	return $return;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CreateKMLEntry($NodeData) {

	// TODO: Visibility3d
	
	$TimeStamp = $NodeData['Timestamp'].".".$NodeData['TimeStampMilliseconds']."Z";
	$TimeStamp = str_replace(" ", "T", $TimeStamp);

	$KMLOutput = "";
	//$KMLOutput.= "<open>0</open>\n";
	$KMLOutput .= "<PhotoOverlay id=\"".$NodeData['ID']."\">\n";
	$KMLOutput .= "<visibility>1</visibility>
		<name>".$NodeData['Name']."</name>
		<shape>rectangle</shape>
		<TimeStamp>
			<when>".$TimeStamp."</when>
		</TimeStamp>
		<Camera>
			<longitude>".$NodeData['Longitude']."</longitude>
			<latitude>".$NodeData['Latitude']."</latitude>
			<altitude>".$NodeData['Altitude']."</altitude>
			<heading>".$NodeData['Heading']."</heading>
			<tilt>".$NodeData['Tilt']."</tilt>
			<roll>".$NodeData['Roll']."</roll>
		</Camera>
		<Icon>
			<href>".$NodeData['PanoramaURL']."</href>
		</Icon>
		<ExtendedData>
			<OriginalData>
				<longitude>".$NodeData['OriginalDataLongitude']."</longitude>
				<latitude>".$NodeData['OriginalDataLatitude']."</latitude>
				<altitude>".$NodeData['OriginalDataAltitude']."</altitude>
				<heading>".$NodeData['OriginalDataHeading']."</heading>
				<tilt>".$NodeData['OriginalDataTilt']."</tilt>
				<roll>".$NodeData['OriginalDataRoll']."</roll>
			</OriginalData>
		<Visibility3d>1</Visibility3d>
	</ExtendedData>\n";

	if ((!isset($NodeData['Description']))||($NodeData['Description']==""))
	    $KMLOutput .= "<description>no description</description>\n";
	else
	    $KMLOutput .= "<description>".$NodeData['Description']."</description>\n";

	$KMLOutput .= "<visibility>1</visibility>\n";
	$KMLOutput.= "</PhotoOverlay>\n";
	return $KMLOutput;
}

function PrintKML($kml) {
	$content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	$content .= "<kml xmlns=\"http://earth.google.com/kml/2.2\">\n";
	$content .= "<Document>\n";
	$content .= "<open>0</open>\n";
	$content .= $kml;
	$content .= "</Document></kml>";
	
	header("Content-Type: text/xml\n");
	header("Content-Length: ".strlen($content)."\n");
	header("Pragma: no-cache\n");
	echo $content;
}

function CreateXMLStringFromArray($arr){
    return AddXMLHeader(ArrayToXMLString($arr));
}

function ArrayToXMLString($a,$pre=""){
    $str="";
    foreach($a as $key=>$value){
	  if (is_array($value)) {
	      if (is_numeric($key)) $key = "li";
	      $str .= $pre."<$key>\n";
	      $str .= ArrayToXMLString($value,$pre."  ");
	      $str .= $pre."</$key>\n";
	  }
	  else {
	      if (is_numeric($key)) $key = "li";
	      $str .= $pre."<$key>$value</$key>\n";
	  }
    }
    return $str;
}

function AddXMLHeader($str){
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"."<response>\n<Document>\n".$str."</Document>\n</response>\n";
}

function is__writable($file){
    if (file_exists($file)) {
	$perms = fileperms($file);
	return (($perms & 2)!=0);
    }else{
	return false;
    }
}

?>