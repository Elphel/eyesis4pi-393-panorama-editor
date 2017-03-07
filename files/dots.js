/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : dots.js
*! REVISION   : 1.0
*! DESCRIPTION: draw lines webgl procedures (originate from drawing arrows)
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

var dotTexture;

var dotVertexPositionBuffer;
var dotVertexPositionBuffer2;

var dotVertexIndexBuffer;
var dotVertexTextureCoordBuffer;
var dotVertexNormalBuffer;

function handleLoadedDotTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initDotTexture() {
    dotTexture = gl.createTexture();
    dotTexture.image = new Image();
    dotTexture.image.onload = function() {
      handleLoadedDotTexture(dotTexture)
    }
    dotTexture.image.src = "files/dot.png";
}
 
function initDotBuffers() {
    
    dotVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexPositionBuffer);
    var vertices = [
	 -1,  0,  0.0,
	 -1,  0,  0.0,
	 -1,  0,  0.0,
	 -1,  0,  0.0,
	  1,  0,  0.0,
	  1,  0,  0.0,
	  1,  0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    dotVertexPositionBuffer.itemSize = 3;
    dotVertexPositionBuffer.numItems = 7;

    dotVertexPositionBuffer2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexPositionBuffer2);
    var vertices2 = [
	 0,  -1,  0.0,
	 0,  -1,  0.0,
	 0,  -1,  0.0,
	 0,  -1,  0.0,
	 0,   1,  0.0,
	 0,   1,  0.0,
	 0,   1,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
    dotVertexPositionBuffer2.itemSize = 3;
    dotVertexPositionBuffer2.numItems = 7;
        
    dotVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexTextureCoordBuffer);
    var textureCoords = [
      1.0,  1.0,
      1.0,  1.0,
      1.0,  1.0,
      1.0,  0.0,
      0.0,  0.0,
      0.0,  1.0,
      0.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    dotVertexTextureCoordBuffer.itemSize = 2;
    dotVertexTextureCoordBuffer.numItems = 7;

    dotVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexNormalBuffer);
    var vertexNormals = [
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0,
	0.0,  1.0,  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
    dotVertexNormalBuffer.itemSize = 3;
    dotVertexNormalBuffer.numItems = 7;

    dotVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dotVertexIndexBuffer);
    var dotVertexIndices = [
      0, 1, 6,
      5, 2, 3,
      5, 3, 4
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dotVertexIndices), gl.STATIC_DRAW);
    dotVertexIndexBuffer.itemSize = 1;
    dotVertexIndexBuffer.numItems = 9;
        
}
  
  function drawLine(axis,angle,down, distance,someVertexPositionBuffer) {

    loadIdentity();
    
    var axisMatrix = createRotationMatrix(angle, [axis.e(1), axis.e(2), axis.e(3)]);
       
    multMatrix(axisMatrix);
    
    mvTranslate([0.0, -down, -distance]);

    setMatrixUniforms();
  
    gl.uniform1f(shaderProgram.alphaUniform, 1.0);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.uniform1f(shaderProgram.alphaUniform, 1.0);    
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dotTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    
    gl.lineWidth(3);
    

    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, dotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, dotVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, dotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, someVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, someVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dotVertexIndexBuffer);
    gl.drawElements(gl.LINE_STRIP, dotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
    
    
  }
  
  