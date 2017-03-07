<?php
/********************************************************************************
*! FILE NAME  : map_pano_file.php
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
*!  $Log: map_pano_file.php,v $
*!
*/

  require_once("call_filter.php");

  $kmlFile="";
  require "pano.inc";

  $latitude="";
  $longitude="";
  $href="";
  $range=0;
  $maskFile="";
  $fullMap=false;
  $interpolate=false;
  $allNodes=false; // include those with visibility=0
  $generateVisibility3d=false;
  $applyVisibility3d=true;
  $interpolateRange=false;
  $ohref="";
  $corrAlt=0;
  $corrLat=0;
  $corrLon=0;
  $forceViewMode=false;
  $protoFile="";
  $relative2kml=false; // relative path to images - false - from this script, true - from kml
  $kmlValid=false;
  if (isset($_GET['latitude']))  $latitude=$_GET['latitude'];
  if (isset($_GET['longitude'])) $longitude=$_GET['longitude'];
  if (isset($_GET['href']))      $href=urldecode($_GET['href']);  // right side of the image url (will compare only this long, prefix may be ommitted)
  if (isset($_GET['kml']))       $kmlFile="kml_files/".urldecode($_GET['kml']);
  if (isset($_GET['range']))     $range=$_GET['range']+0; // additional nodes to show (all other closer than this distance (in meters))
  if (isset($_GET['mask']))      $maskFile="kml_files/".urldecode($_GET['mask']);
  if (isset($_GET['ohref']))     $ohref=urldecode($_GET['ohref']);  // right side of the image url (will compare only this long, prefix may be ommitted)
  if (isset($_GET['corr-alt']))  $corrAlt=$_GET['corr-alt']+0;
  if (isset($_GET['corr-lat']))  $corrLat=$_GET['corr-lat']+0;
  if (isset($_GET['corr-lon']))  $corrLon=$_GET['corr-lon']+0;
  if (isset($_GET['interpolate-range']))  $interpolateRange=true;
  if (isset($_GET['view']))      $forceViewMode=true;
  if (isset($_GET['proto']))     $protoFile="kml_files/".urldecode($_GET['proto']);
  if (isset($_GET['relative-kml']))  $relative2kml=true;
  if ((strpos ($kmlFile,  '..' )!==false) || (strpos ($kmlFile,   '.kml' )===false)) $kmlFile="";
  if ((strpos ($protoFile,'..' )!==false) || (strpos ($protoFile, '.kml' )===false)) $protoFile="";
  if ((strpos ($maskFile, '..' )!==false) || (strpos ($maskFile,  '.kml' )===false)) $maskFile="";
// copy $protoFile to $kmlFile if $kml file does not exist and $protoFile is specified. In failure use $protoFile as $kmlFile in read only mode
  if ($protoFile!="") {
     if (!file_exists($kmlFile)) {
      
       
       $okClone= ($protoFile!="") && file_exists($protoFile) && copy ($protoFile , $kmlFile);
       if ($okClone) {
          chmod($kmlFile, 0666);
       } else {
          $kmlFile=$protoFile;
          $forceViewMode=true;
       }

     }
//    if cloneProtoKML($prefix,$kmlFile,$protoFile)
  }
/*
echo "<pre>\n";
echo "kmlFile=$kmlFile\n";
echo "maskFile=$maskFile\n";
echo "protoFile=$protoFile\n";
exit (0);
*/
//  $writable=is_writable($kmlFile); // does not work on community
  if (($kmlFile!="") && file_exists($kmlFile)) {
    $perms = fileperms($kmlFile);
    $writable=($perms & 2)!=0;
    if ($forceViewMode) $writable=false;
    $kmlValid=true;
  } else {
    generateKML(-1); // empty
    exit (0);
  }


//  if (isset($_GET['v3d']))       {$generateVisibility3d=true;$applyVisibility3d=false;} // may be used separately
  if (isset($_GET['map'])) switch ($_GET['map'])  {
    case "full":        $fullMap=    true;break;
    case "interpolate": $interpolate=true; $allNodes=true; break;
    case "all":         $allNodes=   true; break;
    case "full-all":    $fullMap=    true; $allNodes=true; break;
  } else {
  }
  if (!$writable) {
//     $interpolate=false;
//     $allNodes=false;
     $generateVisibility3d=false;
//     $applyVisibility3d=true;
     $applyVisibility3d=!$allNodes;
     $corrAlt=0;
     $ohref="";
  } else {
    $generateVisibility3d=true;
    $applyVisibility3d=false;
  }

  $prefix='http://'.$_SERVER['SERVER_NAME'].dirname($_SERVER['PHP_SELF']).'/';
  if (dirname($kmlFile)!='.') $prefix.=dirname($kmlFile).'/';
  parseKML($prefix,$kmlFile);
/*
    echo "<pre>\n";
    print_r($world);
    echo "</pre>\n";
    exit(0);
*/

  if ($fullMap) orderWorldAsHrefs();
  if ($maskFile !="") {
     $world_original=$world;
     $worldAttr_original=$worldAttr;
     $world=array();
     $worldAttr=array();
     parseKML($prefix,$maskFile);
     if ($fullMap) orderWorldAsHrefs();

     for ($i=0;$i<count($world);$i++) {
       $world_original[$i]=array_merge($world_original[$i],$world[$i]);
     }
     $worldAttr_original=array_merge($worldAttr_original,$worldAttr);
     $world=$world_original;
     $worldAttr=$worldAttr_original;
  }
// endpoints always keypoints
  $world[0]['visibility']="1";
  $world[count($world)-1]['visibility']="1";
  fixMissingCoordinates($interpolate);
  fixSameCoordinates(); // TODO: improve interpolation later
  if (!$allNodes) removeInvisible();
  connectMap($fullMap); // when false - just previous/next

// TODO: - add other param,eters (i.e. resolution)
// Also - redirect instead of passthrough with header('Location: '.) - will it be faster?
  $currentIndex=findHref($href,$longitude="",$latitude="");
  if ($currentIndex<0) $currentIndex=0; // start with first if not specified/found

  if ($ohref!="") $otherIndex=findHref($ohref);

  if ((($corrAlt!=0) || ($corrLat!=0) || ($corrLon!=0))&& ($otherIndex>=0) && ($otherIndex!=$currentIndex)) {
      correctAltitude( $currentIndex, $otherIndex,$corrAlt,$corrLat,$corrLon);
  }
  if ($interpolateRange && ($otherIndex>=0) && ($otherIndex!=$currentIndex)) {
      interpolateRange($currentIndex, $otherIndex);
  }

//$interpolateRange


  generateKML($currentIndex,$range,$applyVisibility3d,$generateVisibility3d, $writable);
  exit (0);

  function interpolateRange($thisIndex, $otherIndex) {
    global $world;
    if ($otherIndex<$thisIndex) {
      $tmp=$otherIndex;
      $otherIndex=$thisIndex;
      $thisIndex=$tmp;
    }
    $startTime=$world[$thisIndex]['timestamp'];
    $endTime=  $world[$otherIndex]['timestamp'];
    $duration=$endTime-$startTime; // may be negative;
    $deltaAltitude= $world[$otherIndex]['altitude'] -$world[$thisIndex]['altitude'];
    $deltaLatitude= $world[$otherIndex]['latitude'] -$world[$thisIndex]['latitude'];
    $deltaLongitude=$world[$otherIndex]['longitude']-$world[$thisIndex]['longitude'];
    for ($i=$thisIndex+1; $i<$otherIndex;$i++) {
         $thistTime=$world[$i]['timestamp'];
         $world[$i]['altitude']= $world[$thisIndex]['altitude']  + $deltaAltitude*($thistTime-$startTime)/$duration;
         $world[$i]['latitude']= $world[$thisIndex]['latitude']  + $deltaLatitude*($thistTime-$startTime)/$duration;
         $world[$i]['longitude']=$world[$thisIndex]['longitude'] + $deltaLongitude*($thistTime-$startTime)/$duration;
    }
  }

  function correctAltitude($thisIndex, $otherIndex, $deltaAlt,$deltaLat,$deltaLon) {
    global $world;
    $startTime=$world[$thisIndex]['timestamp'];
    $endTime=  $world[$otherIndex]['timestamp'];
    $duration=$endTime-$startTime; // may be negative;
/*
echo "<pre>\n";
echo "thisIndex=$thisIndex\n";
echo "otherIndex=$otherIndex\n";
echo "deltaAlt=$deltaAlt\n";
echo "deltaLat=$deltaLat\n";
echo "deltaLon=$deltaLon\n";
echo "</pre>\n";
exit (0);
*/

    if ($otherIndex>$thisIndex){
       for ($i=$otherIndex;$i<count($world);$i++) {
         $world[$i]['altitude']+=$deltaAlt;
         $world[$i]['latitude']+=$deltaLat;
         $world[$i]['longitude']+=$deltaLon;
       }
       for ($i=$thisIndex+1; $i<$otherIndex;$i++) {
         $thistTime=$world[$i]['timestamp'];
         $world[$i]['altitude']+= $deltaAlt*($thistTime-$startTime)/$duration;
         $world[$i]['latitude']+= $deltaLat*($thistTime-$startTime)/$duration;
         $world[$i]['longitude']+=$deltaLon*($thistTime-$startTime)/$duration;
       }
    } else if ($otherIndex<$thisIndex){
       for ($i=0; $i<=$otherIndex;$i++) {
         $world[$i]['altitude']+=$deltaAlt;
         $world[$i]['latitude']+=$deltaLat;
         $world[$i]['longitude']+=$deltaLon;
       }
       for ($i=$thisIndex+1; $i>$otherIndex;$i--) {
         $thistTime=$world[$i]['timestamp'];
         $world[$i]['altitude']+= $deltaAlt*($thistTime-$startTime)/$duration;
         $world[$i]['latitude']+= $deltaLat*($thistTime-$startTime)/$duration;
         $world[$i]['longitude']+=$deltaLon*($thistTime-$startTime)/$duration;
       }
    }
  }


  function findHref($href,$longitude="",$latitude="") {
    global $world,$numNodes;
    $currentIndex=-1;
    if (($latitude!="") || ($longitude!="") || ($href!="")) foreach ($world as $index=>$node) {
      if ( (($latitude=="")  || ($node['latitude'] ==$latitude)) &&
         (($longitude=="") || ($node['longitude']==$longitude)) &&
        (($href=="")     || ((strlen($node['href'])>=strlen($href)) && (substr($node['href'],-strlen($href))==$href) ))) 
           $currentIndex=$index;         
    }
    return $currentIndex;
  }

  function removeInvisible() {
    global $world,$numNodes;
    $world_original=$world;
    $world=array();
    for ($i=0;$i<count($world_original);$i++) if (!isset($world_original[$i]['visibility']) || ($world_original[$i]['visibility']!="0")) $world[count($world)]=$world_original[$i];
    $numNodes=count($world);
  }
  function orderWorldAsHrefs() {
    global $world;
    $hrefs=array();
    for ($i=0;$i<count($world);$i++) $hrefs[$i]=$world[$i]['href'];
    array_multisort($hrefs,SORT_ASC, SORT_STRING,
                    $world);
  }

  function fixMissingCoordinates($interpolate, $useTimeStamps=true) { // in interpolate mode use "visibility" as bad coordinates (if specified and is "0")
    global $world;
//make sure the world is in time acsending order (using string comparison of href)
    $validCoord=array();
    for ($i=0;$i<count($world);$i++)
         $validCoord[$i]=isset($world[$i]['longitude']) &&
                         isset($world[$i]['latitude']) &&
                         isset($world[$i]['altitude'])  &&
                         (!$interpolate || !isset($world[$i]['visibility']) || ($world[$i]['visibility']!="0"));
    $i0=0;
// skip missing coord;
    while (($i0<count($world)) && !$validCoord[$i0]) $i0++;
    while ($i0<count($world)) {
// skip good coord;
      while (($i0<count($world)) && $validCoord[$i0]) $i0++;
      if ($i0<count($world)) {
// find next good
        $i1=$i0;
        $i0--;
        while (($i1<count($world)) && !$validCoord[$i1]) $i1++;
// missing from $i0+1 to $i1-1;
// now using timestamps, not numbers
        if ($i1<count($world)) {
          if ($useTimeStamps) {
             $startTime=$world[$i0]['timestamp'];
             $endTime=  $world[$i1]['timestamp'];
             $duration=$endTime-$startTime;
             for ($i=1;$i<($i1-$i0);$i++) {
               $k=($world[$i+$i0]['timestamp']-$startTime)/$duration;
               $world[$i+$i0]['longitude']=$world[$i0]['longitude']+($world[$i1]['longitude']-$world[$i0]['longitude'])*$k;
               $world[$i+$i0]['latitude']= $world[$i0]['latitude']+ ($world[$i1]['latitude']-$world[$i0]['latitude'])*$k;
               $world[$i+$i0]['altitude']= $world[$i0]['altitude']+ ($world[$i1]['altitude']-$world[$i0]['altitude'])*$k;
             }
          } else {      
             for ($i=1;$i<($i1-$i0);$i++) {
              $world[$i+$i0]['longitude']=$world[$i0]['longitude']+($world[$i1]['longitude']-$world[$i0]['longitude'])*$i/($i1-$i0);
              $world[$i+$i0]['latitude']= $world[$i0]['latitude']+ ($world[$i1]['latitude']-$world[$i0]['latitude'])*$i/($i1-$i0);
              $world[$i+$i0]['altitude']= $world[$i0]['altitude']+ ($world[$i1]['altitude']-$world[$i0]['altitude'])*$i/($i1-$i0);
             }
          }
        }
        $i0=$i1;
      }
    }

// original values are strings, results - float
/*
    echo "<pre>\n";
    var_dump($world);
    echo "</pre>\n";
    exit(0);
*/
  }




  function fixSameCoordinates() {
    global $world, $map, $numNodes;
//make sure the world is in time acsending order (using string comparison of href)
    $hrefs=array();
    for ($i=0;$i<count($world);$i++) $hrefs[$i]=$world[$i]['href'];
    array_multisort($hrefs,SORT_ASC, SORT_STRING,
                    $world);

    for ($i=0;$i<(count($world)-1);$i++) {
       if (($world[$i]['longitude']==$world[$i+1]['longitude']) &&
           ($world[$i]['latitude']==$world[$i+1]['latitude']) &&
           ($world[$i]['altitude']==$world[$i+1]['altitude'])) {
           $pair=array(array('longitude'=>$world[$i]['longitude'],
                             'latitude'=> $world[$i]['latitude'],
                             'altitude'=> $world[$i]['altitude']),
                       array('longitude'=>$world[$i+1]['longitude'],
                             'latitude'=> $world[$i+1]['latitude'],
                             'altitude'=> $world[$i+1]['altitude']));
// move first point
          if ($i>0) {
            $world[$i]['longitude']=(2*$pair[0]['longitude']+$world[$i-1]['longitude'])/3;
            $world[$i]['latitude']= (2*$pair[0]['latitude']+ $world[$i-1]['latitude'])/3;
            $world[$i]['altitude']= (2*$pair[0]['altitude']+ $world[$i-1]['altitude'])/3;
          }
          if ($i<(count($world)-2)) {
            $world[$i+1]['longitude']=(2*$pair[1]['longitude']+$world[$i+2]['longitude'])/3;
            $world[$i+1]['latitude']= (2*$pair[1]['latitude']+ $world[$i+2]['latitude'])/3;
            $world[$i+1]['altitude']= (2*$pair[1]['altitude']+ $world[$i+2]['altitude'])/3;
          }
       }
    }
// original values are strings, results - float
/*
    echo "<pre>\n";
    var_dump($world);
    echo "</pre>\n";
    exit(0);
*/
  }


  function checkVisibility($world, $this, $other) {
    if (!isset ($world[$this]['v3d'])) return true; // visibility not specified -> visible
    $thisIndex=$world[$this]['name']+0;
    $otherIndex=$world[$other]['name']+0; // use name as index, otherwise some nodes may be filtered out already
    foreach ( $world[$this]['v3d'] as $range) {
       if ((!isset ($range['from']) || ($otherIndex>=($thisIndex+$range['from']))) && (!isset ($range['to']) || ($otherIndex<=($thisIndex+$range['to'])))) return 1;
    }
    return 0;
  }



  function generateKML($index,$distance=0,$filterInvisible3d=true, $generateV3d=false, $writable=true) {
    global $world, $worldAttr, $map, $numNodes;
    $kml=<<<HEADER
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://earth.google.com/kml/2.2">
<Document>

HEADER;
    if ($index>=0) {
      $kml.= sprintf("<open>%s</open>\n",($writable?1:0));
	if (isset($worldAttr['cameraType']) || isset($worldAttr['aboveGround'])) {
		$kml.= "<ExtendedData>\n";
	    if (isset($worldAttr['cameraType'])) $kml.= sprintf("<cameraType>%s</cameraType>\n",$worldAttr['cameraType']);
	    if (isset($worldAttr['aboveGround'])) $kml.= sprintf("<aboveGround>%s</aboveGround>\n",$worldAttr['aboveGround']);
		$kml.= "</ExtendedData>\n";
    }
      $indices=array_merge(array(0=>$index),$map[$index]);
// apply "<open>" tag 0/1 here - needed invisible cameras will be arrows
      if ($filterInvisible3d) for ($i=1;$i<count($indices);$i++)  { // i=0 - not needed (same camera visibility)
        $world[$indices[$i]]['open']=checkVisibility($world, $index, $indices[$i]);
//$kml.= '<!--'.$index.':'.$i.' - '.checkVisibility($world, $index, $indices[$i]).' -->';
//$kml.= '<!--'.$indices[$i].' ->>  '.$world[$indices[$i]]['open'].' -->';
      }
// iterate all pairs, fast way would be to compare lat/long separately
      if ($distance>0) {
        for ($i=0;$i<$numNodes;$i++) if ((array_search($i,$indices)===false) && (distance($world[$i]['latitude'],$world[$i]['longitude'],$world[$index]['latitude'],$world[$index]['longitude']) < $distance) &&
                                       (!$filterInvisible3d || checkVisibility($world, $index, $i))) {
           $indices[count($indices)]=$i;
           if ($filterInvisible3d) $world[$i]['open']='1'; // apply to all, they are open
        }
      }


      foreach ($indices as $i) {
        if (!isset($world[$i]['heading'])) $world[$i]['heading']=0;
        if (!isset($world[$i]['tilt'])) $world[$i]['tilt']=90;
        if (!isset($world[$i]['roll'])) $world[$i]['roll']=0;
        if (!$writable) $world[$i]['visibility']="1"; // no ghosts in readonly mode?
        $kml.= "<PhotoOverlay>\n";
        if (isset($world[$i]['name']))  $kml.=sprintf("  <name>%s</name>\n",$world[$i]['name']);
        if (isset($world[$i]['description']))  $kml.=sprintf("  <description>%s</description>\n",$world[$i]['description']);
        if (isset($world[$i]['visibility']))  $kml.= sprintf("  <visibility>%s</visibility>\n",$world[$i]['visibility']);
        if (isset($world[$i]['open']))  $kml.= sprintf("  <open>%s</open>\n",$world[$i]['open']);
        $kml.= "  <Camera>\n";
        $kml.=sprintf("   <longitude>%s</longitude>\n",$world[$i]['longitude']);
        $kml.=sprintf("   <latitude>%s</latitude>\n",$world[$i]['latitude']);
        $kml.=sprintf("   <altitude>%s</altitude>\n",$world[$i]['altitude']);
        $kml.=sprintf("   <heading>%s</heading>\n",$world[$i]['heading']);
        $kml.=sprintf("   <tilt>%s</tilt>\n",$world[$i]['tilt']);
        $kml.=sprintf("   <roll>%s</roll>\n",$world[$i]['roll']);
        $kml.= "  </Camera>\n";
        if (isset ($world[$i]['when'])) {
         $kml.="  <TimeStamp>\n";
         $kml.=sprintf("   <when>%s</when>\n",$world[$i]['when']);
         $kml.="  </TimeStamp>\n";
        }
        $kml.= "  <Icon>\n";
        $kml.=sprintf("   <href>%s</href>\n",$world[$i]['href']);
        $kml.= "  </Icon>\n";
        if ($generateV3d && isset($world[$i]['v3d'])) {
          $kml.= "  <ExtendedData>\n";
          $kml.= "    <Visibility3d>\n";
          foreach ($world[$i]['v3d'] as $range) {
            $kml.= "      <v3Range>\n";
            if (isset($range['from']))  $kml.=sprintf("        <from>%s</from>\n",$range['from']);
            if (isset($range['to']))    $kml.=sprintf("        <to>%s</to>\n",$range['to']);
            $kml.= "      </v3Range>\n";
          }
          $kml.= "    </Visibility3d>\n";
          $kml.= "  </ExtendedData>\n";
        }
        $kml.= "</PhotoOverlay>\n";
      }
    }
    $kml.=<<<TRAILER
</Document>
</kml>
TRAILER;
    header("Content-Type: text/xml\n");
    header("Content-Length: ".strlen($kml)."\n");
    header("Pragma: no-cache\n");
    echo ($kml);   

  }


  function connectMap($full) {
    global $world, $map, $distances,$numNodes;
    $numNodes=count($world);
    if (!$full) {
      $map=array();
      $map[0]=array(1);
      $map[$numNodes-1]=array($numNodes-2);
      for ($i=1;$i<$numNodes-1;$i++) $map[$i]=array($i-1,$i+1);
      return;
    }
    $distances=array();
    for ($i=1;$i<$numNodes;$i++) {
      $distances[$i]=array();
      for ($j=0;$j<$i;$j++) $distances[$i][$j]= distance($world[$i]['latitude'],$world[$i]['longitude'],$world[$j]['latitude'],$world[$j]['longitude']);
    }
    $map0=array();
    for ($i=0;$i<$numNodes;$i++) $map0[$i]=-1;
    $map0[0]=0;
    $built=false;
    while (!$built) {
      $built=true;
      for ($i=1;$i< $numNodes;$i++) if ($map0[$i]<0) {
        $built=false;
        break;
      }
      if ($built) break;
      $min=360;  // more than maximal distance
      $iMin=-1;
      for ($i=0;$i<$numNodes;$i++) if ($map0[$i]>=0) {
         for ($j=1;$j<$numNodes;$j++) if ($map0[$j]<0) {
           $dist=($j>$i)?$distances[$j][$i]:$distances[$i][$j];
           if ($dist<$min) {
             $min=$dist;
             $iMin=$i;
             $jMin=$j;
           }
         }
      }
      if ($iMin<0) {
         echo "failed to find a pair";
         exit (1);
      }
      $map0[$jMin]=$iMin;
    }
    $map=array();
    for ($i=0;$i<$numNodes;$i++) $map[$i]=array();
    for ($i=1;$i<$numNodes;$i++) {
      $j= $map0[$i];
      $map[$i][count($map[$i])]=$j;
      $map[$j][count($map[$j])]=$i;
    }
  }


  function distance ($lat1,$long1,$lat2,$long2) {
      $earthRadius=6378100; //meters

      $dlat= $lat2- $lat1;
      $dlong=$long2-$long1;
      $lat=($lat1+$lat2)/2;
      $dlong*= cos(deg2rad($lat));
      return pi()*$earthRadius/180* sqrt($dlat*$dlat+$dlong*$dlong);
  }
