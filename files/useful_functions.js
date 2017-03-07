/*!*******************************************************************************
*! FILE NAME  : useful_functions.js
*! DESCRIPTION: some common specific xml parsing
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
*!
*/

//List:
//function ObjectToXMLString(obj,tab_str,wrap)
//function XMLString_CreateNode(prefix,tagname,value)
//function XMLString_Wrap(prefix,tagname,str)
//function XMLString_AddXMLHeader(str,root)
//function XMLString_AddKMLHeader(str,root)
//function XMLToObject(xml,obj)

//I. Array (multi-D specially formatted associative array) to XML-formatted string

// function ArrayToXMLString(obj,tab_str,wrap){
//   var add_tab = (wrap=="")? "":"\t";
//   var disable_wrap = false;
//   var tmp_str = "";  
//   var tmp_tmp_str= "";
//   for (key in obj) {
//     if (typeof(obj[key])!="object") {
//         tmp_str += XMLString_CreateNode(tab_str+add_tab,key,obj[key]);
//     }
//     else {
//       if(parseInt(key)==key) disable_wrap = true;
//       
//       if(parseInt(key)==key) 
//           tmp_tmp_str = ArrayToXMLString(obj[key],tab_str,wrap);        
//       else if ((typeof(obj[key][0])!="object")&&(typeof(obj[key][0])!="undefined")) {
// 	  tmp_tmp_str = XMLString_CreateNode(tab_str+add_tab,key,obj[key][0]);
//       }
//       else 
// 	  tmp_tmp_str = ArrayToXMLString(obj[key],tab_str+add_tab,key);
//       
//       tmp_str += tmp_tmp_str;
//     }
//   }
//   if (!disable_wrap) tmp_str = XMLString_Wrap(tab_str,wrap,tmp_str);
//   return tmp_str;
// }

function ArrayToXMLString(obj,tab_str,wrap){
  var tmp_str = "";
  for (var i=0;i<obj.length;i++) {
      tmp_str += ArrayToXMLString_recursive(obj[i],tab_str,wrap);
  }
  return tmp_str;
}

function ArrayToXMLString_recursive(obj,tab_str,wrap){
  var add_tab = (wrap=="")? "":"\t";
  var tmp_str = "";  
  var tmp_tmp_str= "";
  for (key in obj) {
    if (typeof(obj[key])!="object") {
        tmp_str += XMLString_CreateNode(tab_str+add_tab,key,obj[key]);
    }
    else {
      if ((typeof(obj[key][0])!="object")&&(typeof(obj[key][0])!="undefined")) {
	  tmp_tmp_str = XMLString_CreateNode(tab_str+add_tab,key,obj[key][0]);
      }
      else 
	  tmp_tmp_str = ArrayToXMLString_recursive(obj[key],tab_str+add_tab,key);
      
      tmp_str += tmp_tmp_str;
    }
  }
  tmp_str = XMLString_Wrap(tab_str,wrap,tmp_str);
  return tmp_str;
}

function XMLString_CreateNode(prefix,tagname,value){
  return (prefix+"<"+tagname+">"+value+"</"+tagname+">\n");
}

function XMLString_Wrap(prefix,tagname,str){
  if (str=="")          return str;
  else if (tagname=="") return str;
  else                  return (prefix+"<"+tagname+">\n"+str+prefix+"</"+tagname+">\n");
}

function XMLString_AddXMLHeader(str,root){
  return ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<"+root+">\n"+str+"</"+root+">");
}

function XMLString_AddKMLHeader(str,root){
  return ("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<kml xmlns=\"http://earth.google.com/kml/2.2\">\n<"+root+">\n"+str+"</"+root+">\n</kml>");
}

//II. XML to Array (same as multi-D associative array)
// function XMLToArray(xml){
// 	var tmp = xml.childNodes;
// 	var obj = new Array();
// 	for (var i=0;i<tmp.length;i++) {
// 	      if (tmp[i].nodeType==1) {
// 		    if (tmp[i].firstChild!=null) { // the node is not empty
// 			if (obj[tmp[i].nodeName]==undefined) obj[tmp[i].nodeName] = new Array();
// 			var tmp_len = obj[tmp[i].nodeName].length;
// 			if (obj[tmp[i].nodeName][tmp_len]==undefined) obj[tmp[i].nodeName][tmp_len] = new Array();
// 			if ((tmp[i].firstChild.nodeValue==false)||(tmp[i].firstChild.nodeValue==null)) { // has subnodes
// 			    // recursive iteration
// 			    obj[tmp[i].nodeName][tmp_len] = XMLToArray(tmp[i]);
// 			}else{ // assign value
// 			    obj[tmp[i].nodeName][tmp_len] = tmp[i].firstChild.nodeValue;
// 			}
// 		    }
// 		    //skip empty node, example: <exmpl></exmpl>
// 		    /*else{ 
// 			obj[tmp[i].nodeName] = "undefined";
// 		    }*/
// 	      }
// 	}
// 	return obj;
// }

function XMLToArray(xml){
	var tmp = xml.childNodes;
	var obj = new Array();
	if (tmp[0].nodeType==1) {
	    //console.log(tmp[0].nodeName);
	    tmp = tmp[0].childNodes; // enter top tag
	    if (tmp[1].nodeType==1) {
		//console.log(tmp[1].nodeName);
		tmp = tmp[1].childNodes; // enter top sub-tag
		for (var i=0;i<tmp.length;i++) {
		    if (tmp[i].nodeType==1) {
			var tmp_arr = XMLToArray_recursive(tmp[i]);
			if (Object.keys(tmp_arr).length!=0) obj[obj.length] = tmp_arr;
		    }
		}
	    }
	}
	return obj;
}

function XMLToArray_recursive(xml){
	var tmp = xml.childNodes;
	var obj = new Array();
	for (var i=0;i<tmp.length;i++) {
	      if (tmp[i].nodeType==1) {
		    if (tmp[i].firstChild!=null) { // the node is not empty

			if (obj[tmp[i].nodeName]==undefined) obj[tmp[i].nodeName] = new Array();
			
			if ((tmp[i].firstChild.nodeValue==false)||(tmp[i].firstChild.nodeValue==null)) { // has subnodes
			    // recursive iteration
			    obj[tmp[i].nodeName] = XMLToArray_recursive(tmp[i]);
			}else{ // assign value
			    obj[tmp[i].nodeName] = tmp[i].firstChild.nodeValue;
			}
		    }
		    //skip empty node, example: <exmpl></exmpl>
		    /*else{ 
			obj[tmp[i].nodeName] = "undefined";
		    }*/
		}
	}
	return obj;
}

