<?php
/********************************************************************************
*! FILE NAME  : display_kml.php
*! DESCRIPTION: displays KML records on the page
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
*!  $Log: display_kml.php,v $
*!
*/

include("pano_db_functions.php");

if (isset($_GET['id'])) $id = $_GET['id'];
else                    die("Error Code: 13542");

if (is_file("kml_files/".$id)) {
    $content = file_get_contents("kml_files/".$id);
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($content)."\n");
    header("Pragma: no-cache\n");
    echo $content;
}else{
    ConnectMySQL(); 

    $Nodes = GetNodesByRoute($id);

    $kml = "";

    if (isset($Nodes['error'])) {
	send_response("<?xml version=\"1.0\"?>\n<result><node><error>".$Nodes['error']."</error></node></result>");
	die();
    }

    foreach ($Nodes as $Node) {
	  if (!isset($Node['error'])) $kml .= CreateKMLEntry($Node);
	  else {
	    send_response(CreateXMLStringFromArray($Node['error']));
	    die();
	  }
    }

    if ($kml!="") PrintKML2($kml);
    else          send_response("<?xml version=\"1.0\"?>\n<result><node><error>Some error, no apologies</error></node></result>");
}


function PrintKML2($kml) {
	$content = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	$content .= "<kml xmlns=\"http://earth.google.com/kml/2.2\">\n";
	$content .= "<Document>\n";
	$content .= $kml;
	$content .= "</Document></kml>";
	
	header("Content-Type: text/xml\n");
	header("Content-Length: ".strlen($content)."\n");
	header("Pragma: no-cache\n");
	echo $content;
}