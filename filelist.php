<?php
/********************************************************************************
*! FILE NAME  : filelist.php
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
*!  $Log: filelist.php,v $
*!
*/

require_once("call_filter.php");

//$type = $_GET["type"];
$type = "kml";

$filelist = scandir("kml_files/");

$pre_res_xml="";

foreach ($filelist as $value) {
	//printf($value."\n");
	process_folder($value,$type);
}

flush_xml($pre_res_xml);

function process_folder($file,$type) {

	global $pre_res_xml;

	$ext=get_file_extension("kml_files/".$file);

	// exclude "." & ".."
	if ($ext==$type && (substr($file,0,1)!=".")) {
		    $pre_res_xml .= "<f>$file</f>\n";
	}
}

function get_file_extension($filename) {
	//return substr(strrchr($filename, '.'), 1);
	return pathinfo($filename, PATHINFO_EXTENSION);
}

function flush_xml($pre_res_xml) {

	$res_xml = "<?xml version='1.0' standalone='yes'?>\n";
	$res_xml .="<folder_list>\n";
	$res_xml .= $pre_res_xml;
	$res_xml .="</folder_list>\n";

	header("Content-Type: text/xml");
	header("Content-Length: ".strlen($res_xml)."\n");
	header("Pragma: no-cache\n");
	printf("%s", $res_xml);
	flush();    
}

?>