<?php
/********************************************************************************
*! FILE NAME  : map_pano_db.php
*! DESCRIPTION: original file
*! VERSION:     1.0
*! AUTHOR:      
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
*!  $Log: map_pano_db.php,v $
*!
*/

require_once("call_filter.php");

include("pano_db_functions.php");
ConnectMySQL();

if (isset($_GET['kml'])) {
	$RouteID = $_GET['kml'];
	if ($_GET['map'] == "all") {
		
		$RouteData = GetNodesByRoute($RouteID);
		$kml = "";
		foreach ($RouteData as $Node) {
			$kml .= CreateKMLEntry($Node);
		}
		PrintKML($kml);
	}
	if (isset($_GET['href'])) {
		$kml = "";

		$href = $_GET['href'];

		$nodeID = GetNodeIDbyImageFileName($RouteID, $href);

		$startnode = GetNodeData($nodeID['id']);

		$kml = CreateKMLEntry($startnode);

		$range = $_GET['range'];

		$earthRadius = 6378100; // meters
		$onelatitudedegree = 111110;  // we assume one latitude degree is 111,110 meters everywhere on earth
		$LatMin = $startnode['Latitude'] - (($range / $onelatitudedegree) / 2);
		$LatMax = $startnode['Latitude'] + (($range / $onelatitudedegree) / 2);

		/*
		echo "delta_long: ".(($range / $onelatitudedegree) / 2)." | ";
		echo "lat: ".$startnode['Latitude']." | ";
		echo "long: ".$startnode['Longitude']." | ";
		
		echo "LatMax: ".$LatMax." | ";
		echo "LatMin: ".$LatMin." | ";
		*/

		
		//longitude
		// lat 0° = 111,320m
		// lat 10° = 109,640m
		// lat 20° = 104,650m
		// lat 30° = 96,490m
		// lat 40° = 85,390m
		// lat 50° = 71,700m
		// lat 60° = 55,800m
		// lat 70° = 38,190m
		// lat 80° = 19,390m
		// lat 90° = 0m
		$delta_long = cos($startnode['Latitude']) * $range / $onelatitudedegree; // this is a greatly simplified but still pretty accurate model

		$LongMin = $startnode['Longitude'] - ($delta_long / 2);
		$LongMax = $startnode['Longitude'] + ($delta_long / 2);
		
		//$RouteData_pre = GetNodesAt($LatMin, $LatMax, $LongMin, $LongMax);

		$RouteData = GetNodesAt($LatMin, $LatMax, $LongMin, $LongMax);
		//$RouteData = GetNodesAt($startnode['Latitude'], $startnode['Latitude'], $startnode['Longitude'], $startnode['Longitude']);

		if (count($RouteData) > 0) {
			foreach ($RouteData as $Node) {
				if ($Node['ID']!=$startnode['ID']) $kml .= CreateKMLEntry($Node);
			}
			PrintKML($kml);
		}
		/*$d1 = acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)) * $earthRadius;
		$d1 = acos(sin(lat1)*sin(lat1) + cos(lat1)*cos(lat1) * cos(lon2-lon1)) * $earthRadius;*/
	}
}

?>