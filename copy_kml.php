<?php
/********************************************************************************
*! FILE NAME  : copy_kml.php
*! DESCRIPTION: gets a list of kmls in the directory
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
*!  $Log: copy_kml.php,v $
*!
*/

include("pano_db_functions.php");

require_once("call_filter.php");

if (!isset($_GET['proto'])) die();
if (!isset($_GET['kml'])) die();

if (count(search_kmls())>=10) die("Max file limit");

$proto = $_GET['proto'];
$kml = $_GET['kml'];

if (substr($kml,-3,3)!="kml") die();

if (is_file("kml_files/".$proto)) {
    copy("kml_files/".$proto,"kml_files/".$kml);
    chmod("kml_files/".$kml,0777);
    echo "Done";
}else{
    ConnectMySQL(); 

    $Nodes = GetNodesByRoute($proto);

    $kml_str = "";

    if (isset($Nodes['error'])) {
	echo "Error1";
	die();
    }

    foreach ($Nodes as $Node) {
	  if (!isset($Node['error'])) $kml_str .= CreateKMLEntry($Node);
	  else {
	    send_response(CreateXMLStringFromArray($Node['error']));
	    die();
	  }
    }

    if ($kml_str!="") {
	$result = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	$result .= "<kml xmlns=\"http://earth.google.com/kml/2.2\">\n";
	$result .= "<Document>\n";
	$result .= $kml_str;
	$result .= "</Document></kml>";
	file_put_contents("kml_files/".$kml,$result);
	chmod("kml_files/".$kml,0777);
	echo "Done";
    }else
	echo "Error";
}

?>