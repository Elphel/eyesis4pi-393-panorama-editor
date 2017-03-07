/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : seethrough_slider.js
*! REVISION   : 1.0
*! DESCRIPTION: slider for viewing both textures in the edit mode
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
*! By doing this you can give the whole community a chance to benefit from your changes. 
*! Access to the source code is a precondition for this. 
*! -----------------------------------------------------------------------------**
*/

$(function() {
	$( "#seeThroughSlider" ).slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 99,
		value: 50,
		slide: function( event, ui ) {
			$( "#seeThroughInput" ).val( ui.value/100 );
			$( "#seeThroughInput" ).change();
		}
	});

	$("#seeThroughInput").change(function(e){
		settings.seethrough = $("#seeThroughInput").val();
		drawScene();
		//alert(settings.seethrough);
	});
	
	
});