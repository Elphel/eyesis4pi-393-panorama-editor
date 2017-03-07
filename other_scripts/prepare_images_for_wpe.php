<?php
/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : prepare_images_for_wpe.php
*! REVISION   : 1.0
*! DESCRIPTION: cuts a panorama into 8 squares with 1px overlapping
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
*!  By doing this you can give the whole community a chance to benefit from your changes. 
*!  Access to the source code is a precondition for this. 
*! -----------------------------------------------------------------------------**
*/

$w = 14272;
$h = 4654;

if (!isset($_GET['path'])) {
    printf("No such folder");
    exit(-1);
}

// manage a slash in the path string
$path=cut_path_ending_slash($_GET['path']);

if (!is_dir("$path/result")) {
    mkdir("$path/result");
    exec("chmod 777 $path/result");
}

foreach (scandir($path) as $value) {
	process_images($path,$value);
}

function process_images($path,$file) {
    global $w,$h;
    //resize 
    $ext=get_file_extension($file);

    if ($ext=="tif") {
	$basename = basename($file,".tif");
	echo ($w-1)." \n";
	//cut the left column:
	exec("convert $path/$file -crop ".($w-4)."x".$h."-".($w-5)." $path/result/$file");
	exec("convert $path/$file $path/result/$file +append $path/result/$file");
	exec("convert $path/result/$file -background Black -extent ".($w-3)."x".($w/2-1)." $path/result/$file");
	for ($j=0;$j<2;$j++) {
	   for ($i=0;$i<4;$i++) {
		$tmp_name = "$path/result/{$basename}_".($i+$j*4+1)."_8.$ext";
		exec("convert $path/result/$file -crop ".(          $w-3)."x".(        $w/2-1)."-".((3-$i)*$w/4-(3-$i))."-".((1-$j)*$w/4-(1-$j))." $tmp_name");
		exec("convert $tmp_name          -crop ".(($i+1)*$w/4-$i)."x".(($j+1)*$w/4-$j)."+".(        $i*$w/4-$i)."+".(        $j*$w/4-$j)." $tmp_name");
		exec("convert $tmp_name $path/result/{$basename}_".($i+$j*4+1)."_8.jpeg");
		exec("rm $path/result/{$basename}_".($i+$j*4+1)."_8.$ext");
	   }
	}
	exec("rm $path/result/$file");
    }
}


function cut_path_ending_slash($path) {
  if (substr($path,-1,1)=="/") $path=substr($path,0,-1);
  return $path;
}

function get_file_extension($filename) {
	return pathinfo($filename, PATHINFO_EXTENSION);
}

function get_file_basename($filename) {
	return substr($filename,0,strpos($filename,"."));
}

?>