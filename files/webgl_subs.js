/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : webg_subs.js
*! REVISION   : 1.0 
*! DESCRIPTION: webgl sub procedures
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
 
  function initGL(canvas) {
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
	//alert("Could not initialise WebGL. List of supported browsers: http://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation");
	//window.open("error_no_webgl.html", "Error", 'width=600,height=5,left=5,top=100');
	var top = window.innerHeight;
	var left = window.innerWidth;
	top = (top/2)-$('#error_no_webgl').height()/2;
	left = (left/2)-$('#error_no_webgl').width()/2;
	$('#error_no_webgl').css({top: top+'px',left: left+'px'});
	$('#error_no_webgl').show();
	$('#idSettingsDialog').hide();
    }
  }


  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  var shaderProgram;
  function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,"uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");

    shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting"); 
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor"); 
    shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection"); 
    shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor"); 


  }




  function handleLoadedTextures(texture,index,subindex) {
//alert (index+":"+subindex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // actual transfer to the graphic card
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    panoLoadedSubTextures[index]++;
    if (mapIndices[index]==0){
      if (panoLoadedSubTextures[index]>=numSubTextures){
        switchPanorama();  // was pointing to the next node to go
      } else {
        showProgress (panoLoadedSubTextures[index]/numSubTextures);
      }
    }
  }

  function initTextures() { // do not start actual loading
    for (var i=0; i < panoTexturesSrc.length; i++) for (var j=0; j < numSubTextures; j++)  {
      panoImages[i][j]=new Image();
      panoTextures[i][j] = gl.createTexture();
      panoTextures[i][j].image = panoImages[i][j];
      panoImages[i][j].index=i;
      panoImages[i][j].subindex=j;
      panoImages[i][j].onload= function() {
	handleLoadedTextures(panoTextures[this.index][this.subindex],this.index,this.subindex);
      }
    }
  }

  function loadTexture(number) {
    loadedSubTextures=0;
    for (var j=0; j < numSubTextures; j++) {
      if (numSubTextures==1) {
        panoImages[number][j].src=panoTexturesSrc[number];
      } else {
        var dotIndex=panoTexturesSrc[number].lastIndexOf('.');
        var basename= panoTexturesSrc[number].substring(0,dotIndex);
        var ext=      panoTexturesSrc[number].substring(dotIndex+1,panoTexturesSrc[number].length);
//alert ("loadTexture("+number+"), source="+basename+"_"+(j+1)+"_"+numSubTextures+"."+ext);
        panoImages[number][j].src=basename+"_"+(j+1)+"_"+numSubTextures+"."+ext;
      }
      panoLoadedSubTextures[number]=0;
      if (mapIndices[number]==0) showProgress (0);
    } 
  }

  function handleLoadedArrowTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  var arrowTexture;
  function initArrowTexture() {
    arrowTexture = gl.createTexture();
    arrowTexture.image = new Image();
    arrowTexture.image.onload = function() {
      handleLoadedArrowTexture(arrowTexture)
    }
    arrowTexture.image.src = "files/arrow.png";
  }

  var eyesisTextureSrc =[ "files/eyesis.jpeg","files/eyesis_grey.jpeg","files/eyesis_selected.jpeg","files/eyesis.jpeg"];
  var eyesisTexture = Array(eyesisTextureSrc.length);

function initEyesisTexture() {
    for (var i=0;i<eyesisTextureSrc.length;i++) {
      eyesisTexture[i] = gl.createTexture();
      eyesisTexture[i].image = new Image();
      eyesisTexture[i].image.index = i;
      eyesisTexture[i].image.onload = function() {
        handleLoadedArrowTexture(eyesisTexture[this.index])
      }
      eyesisTexture[i].image.src = eyesisTextureSrc[i];
    }
  }


  var sunTextureSrc ="files/sun.jpeg";
  var sunTexture;
  function initSunTexture() {
    sunTexture = gl.createTexture();
    sunTexture.image = new Image();
    sunTexture.image.onload = function() {
      handleLoadedArrowTexture(sunTexture)
    }
    sunTexture.image.src = sunTextureSrc;
  }


  var footprintsBackpackTextureSrc = ["files/footprints.png","files/footprints_grey.png","files/footprints_selected.png","files/footprints.png"];
  var footprintsBackpackTexture= Array(footprintsBackpackTextureSrc.length);;
  function initFootprintsBackpackTexture() {
    for (var i=0;i<footprintsBackpackTextureSrc.length;i++) {
      footprintsBackpackTexture[i] = gl.createTexture();
      footprintsBackpackTexture[i].image = new Image();
      footprintsBackpackTexture[i].image.index = i;
      footprintsBackpackTexture[i].image.onload = function() {
        handleLoadedArrowTexture(footprintsBackpackTexture[this.index])
      }
      footprintsBackpackTexture[i].image.src = footprintsBackpackTextureSrc[i];
    }
  }





  var panoVertexPositionBuffer;
  var panoVertexNormalBuffer;
  var panoVertexTextureCoordBuffer;
  var panoVertexIndexBuffer;
  var subDivLong;
  var subDivLat;
  function initBuffers() {
    initBuffersPano();
    initArrowBuffers();
    initBuffersSun();
    initBuffersEyesis();
    initBuffersFootprintsBackpack(0.2);
    initDotBuffers();
  }

  function initBuffersPano() {
    panoVertexPositionBuffer=  Array(numSubTextures);
    panoVertexNormalBuffer=  Array(numSubTextures);
    panoVertexTextureCoordBuffer=  Array(numSubTextures);
    panoVertexIndexBuffer=  Array(numSubTextures);
    subDivLong=1;
    subDivLat=1;
    var latitudeBands = 128;//32
    var longitudeBands = 128;
//    var subDivLong=1;
//    var subDivLat=1;
    for (var s=numSubTextures; s>1; s/=2) {
      if (subDivLong> subDivLat) subDivLat*= 2;
      else                       subDivLong*=2;
    }
    var longitudeSubBands=longitudeBands/subDivLong;
    var latitudeSubBands= latitudeBands/subDivLat;

// currently, just for testing the panorama will be split in vertical bands (2?), 
    for (var segmentLat=0;segmentLat<subDivLat;segmentLat++) for (var segmentLong=0;segmentLong<subDivLong;segmentLong++){
      var segment=segmentLat*subDivLong+segmentLong;
      var vertexPositionData = [];
      var normalData = [];
      var textureCoordData = [];
///    alert ("segmentLat="+segmentLat+"\n"+ "segmentLong="+segmentLong+"\n"+ "segment="+segment+"\n");


      for (var latNumber = segmentLat* latitudeSubBands; latNumber <= (segmentLat + 1)* latitudeSubBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber = segmentLong* longitudeSubBands; longNumber <= (segmentLong+1)* longitudeSubBands; longNumber++) {
          var phi = longNumber * 2 * Math.PI / longitudeBands;
          var sinPhi = Math.sin(phi);
          var cosPhi = Math.cos(phi);

          var x = cosPhi * sinTheta;
          var y = cosTheta;
          var z = sinPhi * sinTheta;
          var u = ((longNumber- (segmentLong* longitudeSubBands) ) / longitudeSubBands); // for the inside view
          var v = 1 - ((latNumber - (segmentLat* latitudeSubBands))/ latitudeSubBands);

          normalData.push(x);
          normalData.push(y);
          normalData.push(z);
          textureCoordData.push(u);
          textureCoordData.push(v);
          vertexPositionData.push(worldRadius * x);
          vertexPositionData.push(worldRadius * y);
          vertexPositionData.push(worldRadius * z);
        }
      }
      var indexData = [];
      for (var latNumber = 0; latNumber < latitudeSubBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeSubBands; longNumber++) {
          var first = (latNumber * (longitudeSubBands + 1)) + longNumber;
          var second = first + longitudeSubBands + 1;
          indexData.push(first);
          indexData.push(second);
          indexData.push(first + 1);

          indexData.push(second);
          indexData.push(second + 1);
          indexData.push(first + 1);
        }
      }

      panoVertexNormalBuffer[segment] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexNormalBuffer[segment]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
      panoVertexNormalBuffer[segment].itemSize = 3;
      panoVertexNormalBuffer[segment].numItems = normalData.length / 3;

      panoVertexTextureCoordBuffer[segment] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexTextureCoordBuffer[segment]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
      panoVertexTextureCoordBuffer[segment].itemSize = 2;
      panoVertexTextureCoordBuffer[segment].numItems = textureCoordData.length / 2;

      panoVertexPositionBuffer[segment] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexPositionBuffer[segment]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
      panoVertexPositionBuffer[segment].itemSize = 3;
      panoVertexPositionBuffer[segment].numItems = vertexPositionData.length / 3;

      panoVertexIndexBuffer[segment] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, panoVertexIndexBuffer[segment]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
      panoVertexIndexBuffer[segment].itemSize = 1;
      panoVertexIndexBuffer[segment].numItems = indexData.length;
    }
//    alert ("subDivLong="+subDivLong+"\n"+"subDivLat="+subDivLat+"\n"+ "longitudeSubBands="+longitudeSubBands+"\n"+"latitudeSubBands="+latitudeSubBands+"\n");

  }

  var arrowVertexPositionBuffer;
  var arrowVertexIndexBuffer;
  var arrowVertexTextureCoordBuffer;
  var arrowVertexNormalBuffer;
  function initArrowBuffers() {
    arrowVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexPositionBuffer);
    var vertices = [
         0.0,  0.0, -4.0, 
         0.5,  0.0,  0.0,
         0.25, 0.0,  0.0,
         0.25, 0.0,  4.0,
        -0.25, 0.0,  4.0,
        -0.25, 0.0,  0.0,
        -0.5,  0.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    arrowVertexPositionBuffer.itemSize = 3;
    arrowVertexPositionBuffer.numItems = 7;

    arrowVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexTextureCoordBuffer);
    var textureCoords = [
      0.5,  1.0,
      0.75, 0.5,
      0.625,0.5,
      0.625,0.0,
      0.375,0.0,
      0.375,0.5,
      0.25, 0.5
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    arrowVertexTextureCoordBuffer.itemSize = 2;
    arrowVertexTextureCoordBuffer.numItems = 7;

    arrowVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexNormalBuffer);
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
    arrowVertexNormalBuffer.itemSize = 3;
    arrowVertexNormalBuffer.numItems = 7;

    arrowVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowVertexIndexBuffer);
    var arrowVertexIndices = [
      0, 1, 6,
      5, 2, 3,
      5, 3, 4
    ]
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arrowVertexIndices), gl.STATIC_DRAW);
    arrowVertexIndexBuffer.itemSize = 1;
    arrowVertexIndexBuffer.numItems = 9;

  }

  var eyesisVertexPositionBuffer;
  var eyesisVertexNormalBuffer;
  var eyesisVertexTextureCoordBuffer;
  var eyesisVertexIndexBuffer;
  function initBuffersEyesis() {
    var divs=8;     // 2 - shade separator (21mm), 6 - hole (60mm) for each camera
    var subDivs=4; //8; //2;  // subdivide each unit (see above) for smooth cylinder
    var symmetry=8; // number of camera modules
    var allDivs=subDivs*divs;
    var scale =0.001; // mm/m
    var cavityIndex=20; // 9; // next 6
    var cavityHeight=22; //5; // (not counting points on the edge
    var angleFin=0.01; //half angle thickness of a fin, radians
    var deltaR1=2; // outer shade walls
    var deltaR2=45;// distance to side filters from the outer shade
    var topBottomThickness=2;
    var cavityLong= subDivs+1; // +/-
    var cylinderPoints = [ // axis, radius
         70.625,0,      // 0
         70.625,40,     // 1
          70.625,40,    // 2
         40.75, 40,     // 3
          40.75,40,     // 4
         40.75, 55,     // 5
          40.75,55,     // 6
         79.25, 55,     // 7
          79.25,55,     // 8
         79.25, 50,     // 9 
          79.25,50,     //10
         80.75, 50,     //11
          80.75,50,     //12
         80.75,62.6,    //13 
          80.75,62.6,   //14 
         59.5,  62.6,   //15
          59.5, 62.6,   //16
         59.5,  105,    //17
          59.5, 105,    //18
         46.5,  105,    //19
         30,    105,  // needed for the side lens cavity 18
         25,    105,  // needed for the side lens cavity 19
         20,    105,  // needed for the side lens cavity 20
                      // extra divisions to increase the size of the lens part
         16,    105,  // needed for the side lens cavity 21
         14,    105,  // needed for the side lens cavity 22
         12,    105,  // needed for the side lens cavity 23
         10,    105,  // needed for the side lens cavity 24
          8,    105,  // needed for the side lens cavity 25
          6,    105,  // needed for the side lens cavity 26
          4,    105,  // needed for the side lens cavity 27
          2,    105,  // needed for the side lens cavity 28
          0,    105,  // needed for the side lens cavity 29
         -2,    105,  // needed for the side lens cavity 30
         -4,    105,  // needed for the side lens cavity 31
         -6,    105,  // needed for the side lens cavity 32
         -8,    105,  // needed for the side lens cavity 33
        -10,    105,  // needed for the side lens cavity 34
        -12,    105,  // needed for the side lens cavity 35
        -14,    105,  // needed for the side lens cavity 36
        -16,    105,  // needed for the side lens cavity 37

        -20,    105,  // needed for the side lens cavity 38
        -25,    105,  // needed for the side lens cavity 39
        -30,    105,  // needed for the side lens cavity 40
        -47.5,  105,  // 41
        -61.5,  105,  // 42
         -61.5, 105,  // 43
        -61.5,  54.1, // 44
         -61.5, 54.1, // 45
       -168.95, 54.1, // 46
        -168.95,54.1, // 47
       -171.25, 56.4, // 48
        -171.25,56.4, // 49
       -184.25, 56.4, // 50
        -184.25,56.4, // 51
       -185.75, 59.5, // 52
        -185.75,59.5, // 53
       -191.25, 59.5, // 54
        -191.25,59.5, // 55
       -251.25, 32.5, // 56
        -251.25,32.5, // 57
       -251.25, 30.1625,//58
        -251.25,30.1625,//59
       -1000,   30.1625 //60 
    ];

    var latitudeBands = cylinderPoints.length/2-1;
    var longitudeBands = allDivs*symmetry;
    var vertexPositionData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      var h0=cylinderPoints[2*latNumber]*scale;
      var r0=cylinderPoints[2*latNumber+1]*scale;
      var symLong;
      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        var r=r0;
        var h=h0;
        var phi = longNumber * 2 * Math.PI / longitudeBands;
        symLong= longNumber-allDivs*Math.floor(longNumber/allDivs);
        if (symLong>(allDivs/2)) symLong=allDivs-symLong;
        var v = 1 - (latNumber / latitudeBands);
        var u = 1 - 2*(symLong / allDivs);

        if ((latNumber>=cavityIndex) && (latNumber<= (cavityIndex+cavityHeight)) && (symLong>=cavityLong)) {
          var longNum0=allDivs*Math.floor(longNumber/allDivs); // number of longitude steps till the beginning of this module
          var longNum1=longNumber-longNum0; // number of longitude steps since the beginning of this module
          var phi0 = longNum0 * 2 * Math.PI / longitudeBands; // angle at the beginning of this module
          var phi0a=phi0+ (cavityLong-1)*2 * Math.PI / longitudeBands; // angle at the outer edge  of this module
          var phi0b=phi0+angleFin;

          var phi1 = (longNum0 + allDivs )* 2 * Math.PI / longitudeBands; // angle at the beginning of this module
          var phi1a=phi1-(cavityLong-1)*2 * Math.PI / longitudeBands; // angle at the outer edge  of this module
          var phi1b=phi1-angleFin;
          if      (longNum1<=(cavityLong+1))          phi=phi0a;
          else if (longNum1>=(allDivs-cavityLong-1))  phi=phi1a;
          else if (longNum1==(cavityLong+2))          phi=phi0b;
          else if (longNum1==(allDivs-cavityLong-2))  phi=phi1b;
          else phi=phi0b+(phi1b-phi0b)*(longNum1-cavityLong-3)/(allDivs-2*cavityLong-6);
          if ((symLong==cavityLong) || (latNumber== cavityIndex) || (latNumber==(cavityIndex+cavityHeight)))  r=r0;
          else if ((symLong==(cavityLong+1)) || (symLong==(cavityLong+2) ||
              (latNumber== (cavityIndex+1)) ||
              (latNumber==(cavityIndex+2)) ||
              (latNumber==(cavityIndex+cavityHeight-2)) ||
              (latNumber==(cavityIndex+cavityHeight-1)))) r=r0-deltaR1*scale;
          else r=r0-deltaR2*scale;
          if       (latNumber<= (cavityIndex+1))                                   h=cylinderPoints[2*(cavityIndex-1)]*scale;
          else if  (latNumber>= (cavityIndex+cavityHeight-1))                      h=cylinderPoints[2*(cavityIndex+cavityHeight+1)]*scale;
          else if (latNumber== (cavityIndex+2))                                    h=(cylinderPoints[2*(cavityIndex-2)]-topBottomThickness)*scale;
          else if (latNumber== (cavityIndex+cavityHeight-2))                       h=(cylinderPoints[2*(cavityIndex+cavityHeight+2)]+topBottomThickness)*scale;
          else h= (((cylinderPoints[2*(cavityIndex-2)]-topBottomThickness)*scale)*              (cavityIndex+cavityHeight-3-latNumber)+
                   ((cylinderPoints[2*(cavityIndex+cavityHeight+2)]+topBottomThickness)*scale)* (latNumber-(cavityIndex+3)))/(cavityHeight-6);
        }
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var x = cosPhi * r;
        var y = h;
        var z = sinPhi * r;
        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(x);
        vertexPositionData.push(y);
        vertexPositionData.push(z);
      }
    }

// Handling normalData - average normals connected to the vertex, proportionally to the angles of the triangles connected to it (if it is non-zero) 
// even different - angle*area, so for the smooth rectangular mesh there will be the same contribution for the "90-degree" and a pair of the "45-degree" ones

    var normalData = Array(vertexPositionData.length);
    var normalMaxSize = Array(vertexPositionData.length/3);
    for (var i=0;i<normalMaxSize.length;i++)  normalMaxSize[i]=0;
    for (var i=0;i<normalData.length;i++)  normalData[i]=0;
    

    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
        var first = (latNumber * (longitudeBands + 1)) + longNumber;
        var second = first + longitudeBands + 1;

// Split quadrilateral into 2 triangles so the total area will be minimal
        
        var F =[vertexPositionData[3*first+0], vertexPositionData[3*first+1], vertexPositionData[3*first+2]];
        var S =[vertexPositionData[3*second+0],vertexPositionData[3*second+1],vertexPositionData[3*second+2]];
        var F1=[vertexPositionData[3*first+3], vertexPositionData[3*first+4], vertexPositionData[3*first+5]];
        var S1=[vertexPositionData[3*second+3],vertexPositionData[3*second+4],vertexPositionData[3*second+5]];

        var SF=  [S[0]-  F[0], S[1]-  F[1], S[2]-  F[2]];
        var F1F= [F1[0]- F[0], F1[1]- F[1], F1[2]- F[2]];
        var S1S= [S1[0]- S[0], S1[1]- S[1], S1[2]- S[2]];
        var S1F1=[S1[0]-F1[0], S1[1]-F1[1], S1[2]-F1[2]];

        var nFSF1=  vmul(SF,F1F);
        var nSS1F1= vmul(S1F1,S1S);
        var nFSS1=  vmul(SF,S1S);
        var nFS1F1= vmul(S1F1,F1F);

        var aFSF1=  abs3(nFSF1);
        var aSS1F1= abs3(nSS1F1);
        var aFSS1=  abs3(nFSS1);
        var aFS1F1= abs3(nFS1F1);



        var vIndices, normals, areas, vIndex;
        if ((aFSF1+aSS1F1)>(aFSS1+aFS1F1)){
          vIndices= [[first,second+1,first+1],[first,second,second+1]];
          normals=[unityVector3(nFS1F1),unityVector3(nFSS1)];
          areas=  [aFS1F1,aFSS1];
        } else {
          vIndices= [[first,second,first+1],[second,second+1,first+1]];
          normals=[unityVector3(nFSF1),unityVector3(nSS1F1)];
          areas=[aFSF1,aSS1F1];
        }
        for (var i=0;i<2;i++) {
          if (areas[i]>0.0) for (var j=0;j<3;j++) {
             indexData.push(vIndices[i][j]);
          }
        }
        for (var i=0;i<2;i++) if (areas[i]>0) for (var j=0;j<3;j++) {
          

          var indx0=vIndices[i][j];
          var indx1=vIndices[i][(j+1)%3];
          var indx2=vIndices[i][(j+2)%3];
          var l1=abs3([vertexPositionData[3*indx1+0]-vertexPositionData[3*indx0+0],
                       vertexPositionData[3*indx1+1]-vertexPositionData[3*indx0+1],
                       vertexPositionData[3*indx1+2]-vertexPositionData[3*indx0+2]]);
          var l2=abs3([vertexPositionData[3*indx2+0]-vertexPositionData[3*indx0+0],
                       vertexPositionData[3*indx2+1]-vertexPositionData[3*indx0+1],
                       vertexPositionData[3*indx2+2]-vertexPositionData[3*indx0+2]]);
          var sinAngle=areas[i]/l1/l2;
          if (sinAngle>1.0) sinAngle=1.0;
          else if (sinAngle<-1.0) sinAngle=-1.0;
          var angle=Math.abs(Math.asin(sinAngle)); // Do we need Math.abs() nere?
          var w=angle*areas[i];
          normalData[3*indx0+0]-=normals[i][0]*w;
          normalData[3*indx0+1]-=normals[i][1]*w;
          normalData[3*indx0+2]-=normals[i][2]*w;

        }


      }
    }
    for (var i=0; i<normalData.length; i+=3) {
      var v=[normalData[i],normalData[i+1],normalData[i+2]];
      var l=abs3(v);
      for (var j=i; j<i+3;j++) normalData[j]/=l;

    }
//document.title="indexData.length="+indexData.length;

    eyesisVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    eyesisVertexNormalBuffer.itemSize = 3;
    eyesisVertexNormalBuffer.numItems = normalData.length / 3;

    eyesisVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    eyesisVertexTextureCoordBuffer.itemSize = 2;
    eyesisVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    eyesisVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    eyesisVertexPositionBuffer.itemSize = 3;
    eyesisVertexPositionBuffer.numItems = vertexPositionData.length / 3;

    eyesisVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eyesisVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    eyesisVertexIndexBuffer.itemSize = 1;
    eyesisVertexIndexBuffer.numItems = indexData.length;
  }
  var sunVertexPositionBuffer;
  var sunVertexNormalBuffer;
  var sunVertexTextureCoordBuffer;
  var sunVertexIndexBuffer;
  function initBuffersSun() {
    var sunRays = 16;
    var sunRaysLength=15; // relative to the Sun radius
    var sunRaysWidth=0.4; // relative ray period 

    var radius = worldRadius*16.0*Math.PI/180/60; // 16' (angular minutes)
    var rayRadius=sunRaysLength*radius;
    var vertexPositionData = Array (3*(3*sunRays+1));
    var normalData =         Array(vertexPositionData.length);
    var textureCoordData =   Array (2*(3*sunRays+1));
    var indexData =          Array (3*3*sunRays);
    vertexPositionData[0]=0;
    vertexPositionData[1]=0;
    vertexPositionData[2]=0;
    textureCoordData[0]=0.5;
    textureCoordData[1]=0.5;

    for (var rayNumber=0;rayNumber<sunRays;rayNumber++) {
        var phi0 = rayNumber * 2 * Math.PI / sunRays;
        var phi1 = phi0+ sunRaysWidth* 2 * Math.PI / sunRays;
        var phi2 = phi0+ sunRaysWidth*     Math.PI / sunRays;

        vertexPositionData[3*(2*rayNumber+1)+0]=radius*Math.cos(phi0);
        vertexPositionData[3*(2*rayNumber+1)+1]=radius*Math.sin(phi0);
        vertexPositionData[3*(2*rayNumber+1)+2]=0;

        vertexPositionData[3*(2*rayNumber+2)+0]=radius*Math.cos(phi1);
        vertexPositionData[3*(2*rayNumber+2)+1]=radius*Math.sin(phi1);
        vertexPositionData[3*(2*rayNumber+2)+2]=0;

        vertexPositionData[3*(2*sunRays+rayNumber+1)+0]= rayRadius*Math.cos(phi2);
        vertexPositionData[3*(2*sunRays+rayNumber+1)+1]= rayRadius*Math.sin(phi2);
        vertexPositionData[3*(2*sunRays+rayNumber+1)+2]=0;


        textureCoordData[2*(2*rayNumber+1)+0]=0.25*(2+Math.cos(phi0));
        textureCoordData[2*(2*rayNumber+1)+1]=0.25*(2+Math.sin(phi0));

        textureCoordData[2*(2*rayNumber+2)+0]=0.25*(2+Math.cos(phi1));
        textureCoordData[2*(2*rayNumber+2)+1]=0.25*(2+Math.sin(phi1));

        textureCoordData[2*(2*sunRays+rayNumber+1)+0]= 0.5*(1+Math.cos(phi2));
        textureCoordData[2*(2*sunRays+rayNumber+1)+1]= 0.5*(1+Math.sin(phi2));



    }
    for (var i=0; i<(3*sunRays+1);i++) {
       normalData[3*i  ]=0.0;
       normalData[3*i+1]=0.0;
       normalData[3*i+2]=1.0;
    }

//    for (var i =0; i<2*sunRays; i++) if ((i%2)==0) {
    for (var i =0; i<2*sunRays; i++) {
       indexData[3*i  ]=0; // center point
       indexData[3*i+1]=i+1;
       indexData[3*i+2]=(i==(2*sunRays-1))?1:(i+2);
    }

    for (var i =0; i<sunRays; i++) {
//    for (var i =0; i<1; i++) {
       indexData[3*(i+2*sunRays)  ]=2*i+2;
       indexData[3*(i+2*sunRays)+1]=2*i+1;
       indexData[3*(i+2*sunRays)+2]=i+2*sunRays+1;
    }

    sunVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sunVertexNormalBuffer.itemSize = 3;
    sunVertexNormalBuffer.numItems = normalData.length / 3;

    sunVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    sunVertexTextureCoordBuffer.itemSize = 2;
    sunVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    sunVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sunVertexPositionBuffer.itemSize = 3;
    sunVertexPositionBuffer.numItems = vertexPositionData.length / 3;

    sunVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    sunVertexIndexBuffer.itemSize = 1;
    sunVertexIndexBuffer.numItems = indexData.length;

  }

  var footprintsBackpackVertexPositionBuffer;
  var footprintsBackpackVertexNormalBuffer;
  var footprintsBackpackVertexTextureCoordBuffer;
  var footprintsBackpackVertexIndexBuffer;
// just a circle
  function initBuffersFootprintsBackpack(radius) {
    var segments = 32;
    var vertexPositionData = Array (3*(segments+1));
    var normalData =         Array(vertexPositionData.length);
    var textureCoordData =   Array (2*(segments+1));
    var indexData =          Array (3*segments);
    vertexPositionData[0]=0;
    vertexPositionData[1]=0;
    vertexPositionData[2]=0;
    textureCoordData[0]=0.5;
    textureCoordData[1]=0.5;

    for (var segmentNumber=0;segmentNumber<segments;segmentNumber++) {
        var phi = segmentNumber * 2 * Math.PI / segments;
        var cosPhi=Math.cos(phi);
        var sinPhi=Math.sin(phi);

        vertexPositionData[3*(segmentNumber+1)+2]=radius*cosPhi;
        vertexPositionData[3*(segmentNumber+1)+0]=radius*sinPhi;
        vertexPositionData[3*(segmentNumber+1)+1]=0;

        textureCoordData[2*(segmentNumber+1)+0]=0.5*(1+cosPhi);
        textureCoordData[2*(segmentNumber+1)+1]=0.5*(1+sinPhi);

    }
    for (var i=0; i<(segments+1);i++) {
       normalData[3*i  ]=0.0;
       normalData[3*i+1]=1.0;
       normalData[3*i+2]=0.0;
    }

    for (var i =0; i<segments; i++) {
       indexData[3*i  ]=0; // center point
       indexData[3*i+1]=i+1;
       indexData[3*i+2]=(i==(segments-1))?1:(i+2);
    }

    footprintsBackpackVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    footprintsBackpackVertexNormalBuffer.itemSize = 3;
    footprintsBackpackVertexNormalBuffer.numItems = normalData.length / 3;

    footprintsBackpackVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    footprintsBackpackVertexTextureCoordBuffer.itemSize = 2;
    footprintsBackpackVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    footprintsBackpackVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    footprintsBackpackVertexPositionBuffer.itemSize = 3;
    footprintsBackpackVertexPositionBuffer.numItems = vertexPositionData.length / 3;

    footprintsBackpackVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, footprintsBackpackVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STREAM_DRAW);
    footprintsBackpackVertexIndexBuffer.itemSize = 1;
    footprintsBackpackVertexIndexBuffer.numItems = indexData.length;
  }


  function drawScene() {
    if (currentTextureNumber<0) {
//       document.title="too early to drawScene() - texture not set yet";
       return;
    }
    var newRotationMatrix = createRotationMatrix(elevation, [1, 0, 0]);
    viewRotationMatrix = newRotationMatrix.x(createRotationMatrix(azimuth, [0, 1, 0]));

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    perspective                     (fovY, gl.viewportWidth / gl.viewportHeight, znear, zfar);
    gl.uniform1i(shaderProgram.useLightingUniform, false);

//    drawSun();
    if (editEnabled && (previousTextureNumber>=0) && (settings.seethrough<1.0)) {
      drawPanorama(panoramaRotationMatrix,currentTextureNumber,1.0-settings.seethrough);
      drawPanorama(previousPanoramaRotationMatrix,previousTextureNumber,settings.seethrough);
    } else {
      if (transitionSeeThrough>0.0) {
        drawPanorama(panoramaRotationMatrix,currentTextureNumber,1.0-transitionSeeThrough);
        drawPanorama(previousPanoramaRotationMatrix,previousTextureNumber,transitionSeeThrough);
      } else drawPanorama(panoramaRotationMatrix,currentTextureNumber,1.0);
    }
    drawSun();
    drawArrowsAndCams();

    locateArrows();

    showPlanView(document.getElementById("idShowPlan").checked || (floatingEyesisNum>=0));
    sceneDrawn=true;
    
    clearInterval(loading_intvl);
    $("#status").hide();
    createPermanentLink();
    
  }
  
  function drawArrowsAndCams() {
      if (showArrows) {
        for (var i=1;i<arrows.length;i++) {
	    //if (arrows.length>map.length) alert(map.length+"  "+arrows.length);
            var visibility=settings.markVisibility3d?(map[i].open!==false):(map[i].visibility!==false);
            var type=(settings.edit || (map[i].open!==false))?arrows[i].type:'a';
            drawArrow(arrows[i].angle,arrows[i].down,arrows[i].distance, type, visibility?((i==floatingEyesisNum)?1:0):3, i); //  mode - 0-normal, 1 - "ghost", 2 - selected, last map number, 3 - invisible (visibility=0)
        }
        if (floatingEyesisNum>=0) drawArrow(floatingEyesis.angle,floatingEyesis.down,floatingEyesis.distance, "c", 2, floatingEyesisNum);
      }
      
      if (showArrows) {
	  showMenus();
      }else{
	  hideMenus();
      }
      
    //oleg
    if (editEnabled) {
	drawLine($V([1,0,0,0]),0,0.0,0.5,dotVertexPositionBuffer); // horizontal
	drawLine($V([0,1,0,0]),0,0.0,0.5,dotVertexPositionBuffer2);// vertical
    }    

  }

  
//transitionSeeThrough
  function drawPanorama(rotationMatrix,textureNumber,opacity) {
    loadIdentity();

    multMatrix(viewRotationMatrix);

    multMatrix(rotationMatrix);

    setMatrixUniforms();
    if (opacity<1.0) {
      gl.uniform1f(shaderProgram.alphaUniform, opacity);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.uniform1f(shaderProgram.alphaUniform, opacity);
    } else {
      gl.uniform1f(shaderProgram.alphaUniform, 1.0);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.uniform1f(shaderProgram.alphaUniform, 1.0);
    }
//if (typeof(panoTextures[currentTextureNumber])=='undefined') document.title+=" "+currentTextureNumber+" - undefined!";
    for (var subtexture=0;subtexture<numSubTextures;subtexture++){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, panoTextures[textureNumber][subtexture]);

      gl.uniform1i(shaderProgram.samplerUniform, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexPositionBuffer[subtexture]);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, panoVertexPositionBuffer[subtexture].itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexTextureCoordBuffer[subtexture]);
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, panoVertexTextureCoordBuffer[subtexture].itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, panoVertexNormalBuffer[subtexture]);
      gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, panoVertexNormalBuffer[subtexture].itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, panoVertexIndexBuffer[subtexture]);
      gl.drawElements(gl.TRIANGLES, panoVertexIndexBuffer[subtexture].numItems, gl.UNSIGNED_SHORT, 0);

    }
}

var sunRotationMatrix3x3;
  function drawSun() {
    loadIdentity();

    multMatrix(viewRotationMatrix);
    multMatrix(createRotationMatrix(-Sun.azimuth, [0, 1, 0]));
    multMatrix(createRotationMatrix(Sun.elevation, [1, 0, 0]));
    Sun.unitVector=mvMatrix.make3x3().x(Vector.create([0,0,-1]));
    mvTranslate([0.0, 0.0, -0.9*worldRadius]);

    setMatrixUniforms();
    gl.uniform1f(shaderProgram.alphaUniform, 1.0);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);

    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sunVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sunVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sunVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sunVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sunVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, sunVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
//    gl.drawElements(gl.LINE_STRIP, sunVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

  }

  function drawArrow(angle,down, distance, type,mode, mapNumber) { // mode=0 - normal, mode 1 - eyesis "ghost", mode 2 - moving eyesis, 3 - "invisible"
    var isEyesis= (type=="c") || (mode!=0); // isn't (type=="c") enough?
// Set lighting
    gl.uniform1i(shaderProgram.useLightingUniform, isEyesis); 
    if (isEyesis) { 
      var directionalRGB=    [Sun.directionalRGB[0]*Sun.fraction, Sun.directionalRGB[1]*Sun.fraction, Sun.directionalRGB[2]*Sun.fraction];
      var ambientRGB=[Sun.ambientRGB[0]*(1.0-Sun.fraction),Sun.ambientRGB[0]*(1.0-Sun.fraction),Sun.ambientRGB[0]*(1.0-Sun.fraction)];
      gl.uniform3f(shaderProgram.ambientColorUniform, ambientRGB[0],ambientRGB[1],ambientRGB[1]); 
      var lightingDirection = Sun.unitVector; 
      var adjustedLD = lightingDirection.toUnitVector(); 
      var flatLD = adjustedLD.flatten(); 
      gl.uniform3f( shaderProgram.lightingDirectionUniform, flatLD[0], flatLD[1], flatLD[2] ); 
    gl.uniform3f( shaderProgram.directionalColorUniform, directionalRGB[0],directionalRGB[1],directionalRGB[2]); 
    } 


    loadIdentity();

    multMatrix(viewRotationMatrix);


    if (!isEyesis) {
      multMatrix(createRotationMatrix(angle, [0, 1, 0]));
      mvTranslate([0.0, -down, -Math.abs(distance)]);
      setMatrixUniforms();
      gl.uniform1f(shaderProgram.alphaUniform, 1.0);
      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.uniform1f(shaderProgram.alphaUniform, 1.0);


      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, arrowTexture);
      gl.uniform1i(shaderProgram.samplerUniform, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexTextureCoordBuffer);
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, arrowVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexNormalBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, arrowVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, arrowVertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, arrowVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, arrowVertexIndexBuffer);
      gl.drawElements(gl.TRIANGLES, arrowVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    } else {
// should just move, no rotaion
// Show Eyesis camera
      if (((mode>0) && (mode!=3)) || showCams) {
        var arad=angle*Math.PI/180;
        mvTranslate([-Math.abs(distance)*Math.sin(arad), -down, -Math.abs(distance)*Math.cos(arad)]);
//        multMatrix(createRotationMatrix( -map[mapNumber].heading,  [0, 1, 0])); /// TODO: add/subtract cameraHeading? 
        multMatrix(createRotationMatrix( -(map[mapNumber].heading- map[mapNumber].cameraHeading),  [0, 1, 0]));
        multMatrix(createRotationMatrix(  map[mapNumber].tilt-90,  [1, 0, 0]));
        multMatrix(createRotationMatrix(  map[mapNumber].roll,     [0, 0, 1]));
        multMatrix(createRotationMatrix(  90,  [0, 1, 0])); // does nothing visible
        setMatrixUniforms();
        if (mode==0) {
          gl.uniform1f(shaderProgram.alphaUniform, 1.0);
          gl.disable(gl.BLEND);
          gl.enable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 1.0);
        } else if ((mode==1) || (mode==3)) {
          gl.uniform1f(shaderProgram.alphaUniform, 0.5);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.enable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 0.5);
        } else {
          gl.uniform1f(shaderProgram.alphaUniform, 0.8);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.enable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 0.8);
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, eyesisTexture[mode]);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, eyesisVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, eyesisVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, eyesisVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, eyesisVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eyesisVertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, eyesisVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      }

// show footprints
      if ((map[mapNumber].cameraType=="eyesis_backpack") || (map[mapNumber].cameraType=="eyesis_tripod")) {
//      	    console.log("Show footprints:  aboveGround="+map[mapNumber].aboveGround+" cameraType="+map[mapNumber].cameraType+" mapNumber="+mapNumber+" mode="+mode);
//document.title="eyesis_backpack"+mapNumber;
        loadIdentity();
        multMatrix(viewRotationMatrix);
        var arad=angle*Math.PI/180;
        mvTranslate([-Math.abs(distance)*Math.sin(arad), -(down+ map[mapNumber].aboveGround), -Math.abs(distance)*Math.cos(arad)]);
        multMatrix(createRotationMatrix( -(map[mapNumber].heading- map[mapNumber].cameraHeading),  [0, 1, 0]));
//        multMatrix(createRotationMatrix(  map[mapNumber].tilt-90,  [1, 0, 0]));
//        multMatrix(createRotationMatrix(  map[mapNumber].roll,     [0, 0, 1]));
        multMatrix(createRotationMatrix(  90,  [0, 1, 0])); 
        setMatrixUniforms();
        if (mode==0) {
          gl.uniform1f(shaderProgram.alphaUniform, 1.0);
          gl.disable(gl.BLEND);
          gl.enable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 1.0);
        } else if (mode==1) {
          gl.uniform1f(shaderProgram.alphaUniform, 0.5);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.enable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 0.5);
        } else {
          gl.uniform1f(shaderProgram.alphaUniform, 0.8);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          gl.enable(gl.BLEND);
          gl.disable(gl.DEPTH_TEST);
          gl.uniform1f(shaderProgram.alphaUniform, 0.8);
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, footprintsBackpackTexture[mode]);
        gl.uniform1i(shaderProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, footprintsBackpackVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, footprintsBackpackVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, footprintsBackpackVertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, footprintsBackpackVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, footprintsBackpackVertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, footprintsBackpackVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


      }// else console.log("Dop not show footprints:  aboveGround="+map[mapNumber].aboveGround+" cameraType="+map[mapNumber].cameraType+" mapNumber="+mapNumber+" mode="+mode);
    }
  }

  var labelHeight=16;
  var labelWidth=36;

  function locateArrows() {
    arrowsVisible=Array(arrows.length);
    arrowsXY=     Array(arrows.length);
    var id;
    var innerHTML=""; 
    var labelMaxX=gl.viewportWidth-labelWidth/2;   // to prevent labels leave the canvas (and cause scrollbars)
    var labelMaxY=gl.viewportHeight-labelHeight/2;
    arrowsVisible[0]=false; // just in case
    var hotSpotBelow=!showCams || (typeof(clickCams)=='undefined') || !clickCams;
    for (var i=1;i<arrows.length;i++) {
      loadIdentity();
      multMatrix(pMatrix);

      mvTranslate([0.0, 0, -2.0*znear]); // This I do not understand, but it (moving projection plane on the other side of the viewer) works. AF

      multMatrix(viewRotationMatrix);
      multMatrix(createRotationMatrix(arrows[i].angle, [0, 1, 0]));
// make hotspot at the footsteps, not at the camera
      if ((arrows[i].type=='c') && ((map[i].cameraType=="eyesis_backpack") || (map[i].cameraType=="eyesis_tripod")) && hotSpotBelow) { // or some other?
        mvTranslate([0.0, -(arrows[i].down+map[i].aboveGround), -Math.abs(arrows[i].distance)]);
      } else {
        mvTranslate([0.0, -arrows[i].down, -Math.abs(arrows[i].distance)]);
      }
      arrowsVisible[i]=(mvMatrix.elements[2][3]>0.0); // other side - both mvMatrix.elements[2][3] and mvMatrix.elements[3][3] are negative
      if (arrowsVisible[i]) {
        arrowsXY[i]={x:Math.round(0.5*(1.0+(mvMatrix.elements[0][3]/mvMatrix.elements[2][3]))*gl.viewportWidth), // too fast for close obj, good for arrows
                     y:Math.round(0.5*(1.0-(mvMatrix.elements[1][3]/mvMatrix.elements[2][3]))*gl.viewportHeight)};
        if (settings.labels && showArrows && (arrowsXY[i].x<labelMaxX) && (arrowsXY[i].y<labelMaxY)) {
          id="idTarget"+((i<10)?"0":"")+i;
	  var ts="";
//          if (typeof(map[i].description)!='undefined') ts+=map[i].description+" ";
//          else if (typeof(map[i].name)!='undefined')   ts+=map[i].name+" ";
          if (typeof(map[i].name)!='undefined')   ts+=map[i].name+" - ";
          if (typeof(map[i].description)!='undefined') ts+=map[i].description+" ";
          ts+=map[i].time.hour+":"+map[i].time.minute+":"+Math.round(map[i].time.second*10)/10;
          var visibility=settings.markVisibility3d?(map[i].open!==false):(map[i].visibility!==false);
          var color=visibility?"#ffdddd":"#668888";

          innerHTML+='<div id="'+id+'" style="position:absolute;text-align:center;font-size:12px;width:'+labelWidth+'px;height:'+labelHeight+'px;left:'+(arrowsXY[i].x-labelWidth/2)+'px;top:'+(arrowsXY[i].y-labelHeight/2)+'px;'+
                     'background-color:#ffffff;" title="'+ts+'" '+
                     'ondragstart = "cancellingEventHandler()" ondraggesture="cancellingEventHandler()" onselectstart="cancellingEventHandler()" '+
                     'onmousedown="clickedLabel(event,'+i+');"'+
                     '>'+(Math.round(10*Math.abs(map[i].distance))/10)+'m</div>';
        }
      }
    }
    if (floatingEyesisNum>=0) {
      loadIdentity();
      multMatrix(pMatrix);
      multMatrix(viewRotationMatrix);
      multMatrix(createRotationMatrix(floatingEyesis.angle, [0, 1, 0]));
      if ((map[floatingEyesisNum].cameraType=="eyesis_backpack") || (map[floatingEyesisNum].cameraType=="eyesis_tripod") ) { // or some other? eyesis_tripod
        mvTranslate([0.0, -(floatingEyesis.down+map[floatingEyesisNum].aboveGround), -Math.abs(floatingEyesis.distance)]);

      } else {
        mvTranslate([0.0, -floatingEyesis.down, -Math.abs(floatingEyesis.distance)]);
      }
      floatingEyesisVisible=(mvMatrix.elements[2][3]>0.0); // other side - both mvMatrix.elements[2][3] and mvMatrix.elements[3][3] are negative
      if (floatingEyesisVisible) {
        floatingEyesisXY=[Math.round(0.5*(1.0+(mvMatrix.elements[0][3]/mvMatrix.elements[2][3]))*gl.viewportWidth),
        Math.round(0.5*(1.0-(mvMatrix.elements[1][3]/mvMatrix.elements[2][3]))*gl.viewportHeight)];
        if (settings.labels && showArrows) {
          id="idTarget00";
	  var ts="";
//          if (typeof(map[floatingEyesisNum].description)!='undefined') ts+=map[floatingEyesisNum].description+' ';
//          else if (typeof(map[floatingEyesisNum].name)!='undefined')   ts+=map[floatingEyesisNum].name+' ';
          if (typeof(map[floatingEyesisNum].name)!='undefined')        ts+=map[floatingEyesisNum].name+" - ";
          if (typeof(map[floatingEyesisNum].description)!='undefined') ts+=map[floatingEyesisNum].description+" ";
          ts+=map[floatingEyesisNum].time.hour+":"+map[floatingEyesisNum].time.minute+":"+Math.round(map[floatingEyesisNum].time.second*10)/10;
          innerHTML+='<div id="'+id+'" style="position:absolute;text-align:center;font-size:12px;width:'+labelWidth+'px;height:'+labelHeight+'px;left:'+(floatingEyesisXY[0]-labelWidth/2)+'px;top:'+(floatingEyesisXY[1]-labelHeight/2)+'px;'+
                     'background-color:#ffbbbb;" title="'+ts+'" '+
                     'ondragstart = "cancellingEventHandler()" ondraggesture="cancellingEventHandler()" onselectstart="cancellingEventHandler()" '+
                     'onmousedown="clickedLabel(event,'+0+');"'+
                     '>'+(Math.round(10*Math.abs(floatingEyesis.distance))/10)+'m</div>';
        }
      }
    }
    document.getElementById("idLabels").innerHTML=innerHTML;
  }


// subs
  function vmul(a,b) {
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  }
  function area(a,b) {
    var v=vmul(a,b);
    return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  }
  function abs3(v) {
     return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
  }
  function unityVector3(v) {
     l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
     if (l==0) return [0,0,0];
     else return [v[0]/l,v[1]/l,v[2]/l];
  }
  var mvMatrix;
  var mvMatrixStack = [];

  function mvPushMatrix(m) {
    if (m) {
      mvMatrixStack.push(m.dup());
      mvMatrix = m.dup();
    } else {
      mvMatrixStack.push(mvMatrix.dup());
    }
  }

  function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
  }

  function loadIdentity() {
    mvMatrix = Matrix.I(4);
  }


  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }


  function mvTranslate(v) {
    var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
  }


  function createRotationMatrix(angle, v) {
    var arad = angle * Math.PI / 180.0;
    return Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
  }


  function mvRotate(angle, v) {
    multMatrix(createRotationMatrix(angle, v));
  }


  var pMatrix;
  function perspective(fovy, aspect, znear, zfar) {
    pMatrix = makePerspective(fovy, aspect, znear, zfar);
  }

  function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));

    var normalMatrix = mvMatrix.inverse();
    normalMatrix = normalMatrix.transpose();
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, new Float32Array(normalMatrix.flatten()));
  }
