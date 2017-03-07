<?php
/********************************************************************************
*! FILE NAME  : map_pano.php
*! DESCRIPTION: db / file multiplexor
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
*!  $Log: map_pano.php,v $
*!
*/

require_once("call_filter.php");

if (isset($_GET['kml'])) {
      if (is_file("kml_files/".$_GET['kml'])) require("map_pano_file.php");
      else                       require("map_pano_db.php");
}else{
    echo "Hahaha, well";
}

?> 
