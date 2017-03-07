<?php
$world=array();
$worldAttr=array();
$state=array('currentNode'=>-1,
             'urlPrefix'=>'',
             'currentValue'=>'',
             'imgOn'=>false,
             'ExtendedData'=>false,
             'Visibility3d'=>false,
             'v3Range'=>false);
function startElement($parser, $name, $attrs) 
{
    global $world,$state;
    switch ($name) {
      case 'PhotoOverlay':
        $state['currentNode']=count($world);
        $world[$state['currentNode']]=array();
        break;
      case 'Icon':
        if (!$state['ExtendedData']) $state['imgOn']=true;
        break;
      case 'ExtendedData':
        $state['ExtendedData']=true;
        break;
      case 'Visibility3d':
        $state['Visibility3d']=true;
        $world[$state['currentNode']]['v3d']=array();
        break;
      case 'v3Range':
        $state['v3Range']=true;
        $world[$state['currentNode']]['v3d'][count($world[$state['currentNode']]['v3d'])]=array();
        break;


    }
}

function endElement($parser, $name) 
{
    global $world,$worldAttr,$state;
    $currentNode=$state['currentNode'];
    $currentValue=$state['currentValue'];
    if (!$state['ExtendedData']) {
      switch ($name) {
        case 'longitude':
          $world[$currentNode]['longitude']=$currentValue;
          break;
        case 'latitude':
          $world[$currentNode]['latitude']=$currentValue;
          break;
        case 'altitude':
          $world[$currentNode]['altitude']=$currentValue;
          break;
        case 'heading':
          $world[$currentNode]['heading']=$currentValue;
          break;
        case 'tilt':
          $world[$currentNode]['tilt']=$currentValue;
          break;
        case 'roll':
          $world[$currentNode]['roll']=$currentValue;
          break;
        case 'name':
          $world[$currentNode]['name']=$currentValue;
          break;
        case 'description':
          $world[$currentNode]['description']=$currentValue;
          break;
        case 'visibility':
          $world[$currentNode]['visibility']=$currentValue;
          break;
        case 'Icon':
          $state['imgOn']=false;
          break;
        case 'href':
          if ($state['imgOn']) {
            if (substr($currentValue,0,strlen("http://"))=="http://") $world[$currentNode]['href']=$currentValue;
            else $world[$currentNode]['href']=$state['urlPrefix'].$currentValue;
          }
          break;
        case 'when': // adds just a single element when, disregarding were in the current PhotoOverlay it is
          $world[$currentNode]['when']=$currentValue;
          $aDate=date_parse($currentValue);
          $world[$currentNode]['timestamp']= mktime ($aDate['hour'],$aDate['minute'],$aDate['second'],$aDate['month'],$aDate['day'],$aDate['year'] )+$aDate['fraction'];
          break;
      }
    } else { // parsing ExtendedData
      switch ($name) {
      	// global world attributes (not per-node) - assuming all images made with the same camera - TODO - add overwrite for individual parameters?
      	
        case 'cameraType':
          $worldAttr['cameraType']=$currentValue;
          break;
        case 'aboveGround':
          $worldAttr['aboveGround']=$currentValue;
          break;
		
        // per-node parameters
        case 'ExtendedData':
          $state['ExtendedData']=false;
          break;
        case 'Visibility3d':
          $state['Visibility3d']=false;
          break;
        case 'v3Range':
          $state['v3Range']=    false;
        break;
      }
      if ($state['v3Range']) switch ($name) {
        case 'to':
          $world[$state['currentNode']]['v3d'][count($world[$state['currentNode']]['v3d'])-1]['to']=$currentValue;
          break;
        case 'from':
          $world[$state['currentNode']]['v3d'][count($world[$state['currentNode']]['v3d'])-1]['from']=$currentValue;
          break;
      }

    }
}

function characterData($parser, $data) 
{
    global $state;
    $state['currentValue']=$data;
}


// $base - directory, where there is the  .kml file, root directory for image files
function parseKML($prefix,$name) {
  global $world,$state;
  $state['urlPrefix']=$prefix;
  $xml_parser = xml_parser_create();
// use case-folding so we are sure to find the tag in $map_array
  xml_parser_set_option($xml_parser, XML_OPTION_CASE_FOLDING, false);
  xml_set_element_handler($xml_parser, "startElement", "endElement");
  xml_set_character_data_handler($xml_parser, "characterData");
  $data=file_get_contents($name);
  if (!xml_parse($xml_parser, $data)) {
        die(sprintf("XML error: %s at line %d",
                    xml_error_string(xml_get_error_code($xml_parser)),
                    xml_get_current_line_number($xml_parser)));
  }
  xml_parser_free($xml_parser);
  return $world;
}

?>