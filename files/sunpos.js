/*!
 *! Based on original work of National Oceanic and Atmospheric Administration, United States Department of Commerce
 *! Description: This script can calculate the suns position based on date, time and latitude/longitude.
 *! Original source at: http://www.srrb.noaa.gov/highlights/sunrise/azel.html
 *! This version uses positive longitude for East, negative - for West
-----------------------------------------------------------------------------**
 *! Copyright (C) 2011 Elphel, Inc.
 *!
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
 *!   * The freedom to study how the program works, and change it to make it do what you wish (freedom 1). Access to the source code is a precondition for this.
 *!   * The freedom to redistribute copies so you can help your neighbor (freedom 2).
 *!   * The freedom to distribute copies of your modified versions to others (freedom 3). 
 *!
 *! By doing this you can give the whole community a chance to benefit from your changes. Access to the source code is a precondition for this. 
-----------------------------------------------------------------------------**/


//***********************************************************************/
//* Name:    calcJD									*/
//* Type:    Function									*/
//* Purpose: Julian day from calendar day						*/
//* Arguments:										*/
//*   year : 4 digit year								*/
//*   month: January = 1								*/
//*   day  : 1 - 31									*/
//* Return value:										*/
//*   The Julian day corresponding to the date					*/
//* Note:											*/
//*   Number is returned for start of day.  Fractional days should be	*/
//*   added later.									*/
//* Modified so the East longitude is positive!
//* http://www.srrb.noaa.gov/highlights/sunrise/azel.html                              */
//***********************************************************************/

	function calcJD(year, month, day)
	{
		if (month <= 2) {
			year -= 1;
			month += 12;
		}
		var A = Math.floor(year/100);
		var B = 2 - A + Math.floor(A/4);

		var JD = Math.floor(365.25*(year + 4716)) + Math.floor(30.6001*(month+1)) + day + B - 1524.5;
		return JD;
	}




//***********************************************************************/
//* Name:    calcTimeJulianCent							*/
//* Type:    Function									*/
//* Purpose: convert Julian Day to centuries since J2000.0.			*/
//* Arguments:										*/
//*   jd : the Julian Day to convert						*/
//* Return value:										*/
//*   the T value corresponding to the Julian Day				*/
//***********************************************************************/

	function calcTimeJulianCent(jd)
	{
		var T = (jd - 2451545.0)/36525.0;
		return T;
	}


//***********************************************************************/
//* Name:    calGeomMeanLongSun							*/
//* Type:    Function									*/
//* Purpose: calculate the Geometric Mean Longitude of the Sun		*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the Geometric Mean Longitude of the Sun in degrees			*/
//***********************************************************************/

	function calcGeomMeanLongSun(t)
	{
		var L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
		while(L0 > 360.0)
		{
			L0 -= 360.0;
		}
		while(L0 < 0.0)
		{
			L0 += 360.0;
		}
		return L0;		// in degrees
	}


//***********************************************************************/
//* Name:    calGeomAnomalySun							*/
//* Type:    Function									*/
//* Purpose: calculate the Geometric Mean Anomaly of the Sun		*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the Geometric Mean Anomaly of the Sun in degrees			*/
//***********************************************************************/

	function calcGeomMeanAnomalySun(t)
	{
		var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
		return M;		// in degrees
	}

//***********************************************************************/
//* Name:    calcEccentricityEarthOrbit						*/
//* Type:    Function									*/
//* Purpose: calculate the eccentricity of earth's orbit			*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the unitless eccentricity							*/
//***********************************************************************/


	function calcEccentricityEarthOrbit(t)
	{
		var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
		return e;		// unitless
	}

//***********************************************************************/
//* Name:    calGeomMeanLongSun							*/
//* Type:    Function									*/
//* Purpose: calculate the Geometric Mean Longitude of the Sun		*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the Geometric Mean Longitude of the Sun in degrees			*/
//***********************************************************************/

	function calcGeomMeanLongSun(t)
	{
		var L0 = 280.46646 + t * (36000.76983 + 0.0003032 * t);
		while(L0 > 360.0)
		{
			L0 -= 360.0;
		}
		while(L0 < 0.0)
		{
			L0 += 360.0;
		}
		return L0;		// in degrees
	}


//***********************************************************************/
//* Name:    calGeomAnomalySun							*/
//* Type:    Function									*/
//* Purpose: calculate the Geometric Mean Anomaly of the Sun		*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the Geometric Mean Anomaly of the Sun in degrees			*/
//***********************************************************************/

	function calcGeomMeanAnomalySun(t)
	{
		var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
		return M;		// in degrees
	}

//***********************************************************************/
//* Name:    calcEccentricityEarthOrbit						*/
//* Type:    Function									*/
//* Purpose: calculate the eccentricity of earth's orbit			*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   the unitless eccentricity							*/
//***********************************************************************/


	function calcEccentricityEarthOrbit(t)
	{
		var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
		return e;		// unitless
	}

//***********************************************************************/
//* Name:    calcSunEqOfCenter							*/
//* Type:    Function									*/
//* Purpose: calculate the equation of center for the sun			*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   in degrees										*/
//***********************************************************************/


	function calcSunEqOfCenter(t)
	{
		var m = calcGeomMeanAnomalySun(t);

		var mrad = degToRad(m);
		var sinm = Math.sin(mrad);
		var sin2m = Math.sin(mrad+mrad);
		var sin3m = Math.sin(mrad+mrad+mrad);

		var C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
		return C;		// in degrees
	}

//***********************************************************************/
//* Name:    calcSunTrueLong								*/
//* Type:    Function									*/
//* Purpose: calculate the true longitude of the sun				*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun's true longitude in degrees						*/
//***********************************************************************/


	function calcSunTrueLong(t)
	{
		var l0 = calcGeomMeanLongSun(t);
		var c = calcSunEqOfCenter(t);

		var O = l0 + c;
		return O;		// in degrees
	}

//***********************************************************************/
//* Name:    calcSunTrueAnomaly							*/
//* Type:    Function									*/
//* Purpose: calculate the true anamoly of the sun				*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun's true anamoly in degrees							*/
//***********************************************************************/

	function calcSunTrueAnomaly(t)
	{
		var m = calcGeomMeanAnomalySun(t);
		var c = calcSunEqOfCenter(t);

		var v = m + c;
		return v;		// in degrees
	}

//***********************************************************************/
//* Name:    calcSunRadVector								*/
//* Type:    Function									*/
//* Purpose: calculate the distance to the sun in AU				*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun radius vector in AUs							*/
//***********************************************************************/

	function calcSunRadVector(t)
	{
		var v = calcSunTrueAnomaly(t);
		var e = calcEccentricityEarthOrbit(t);
 
		var R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));
		return R;		// in AUs
	}

//***********************************************************************/
//* Name:    calcSunApparentLong							*/
//* Type:    Function									*/
//* Purpose: calculate the apparent longitude of the sun			*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun's apparent longitude in degrees						*/
//***********************************************************************/

	function calcSunApparentLong(t)
	{
		var o = calcSunTrueLong(t);

		var omega = 125.04 - 1934.136 * t;
		var lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
		return lambda;		// in degrees
	}

//***********************************************************************/
//* Name:    calcMeanObliquityOfEcliptic						*/
//* Type:    Function									*/
//* Purpose: calculate the mean obliquity of the ecliptic			*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   mean obliquity in degrees							*/
//***********************************************************************/

	function calcMeanObliquityOfEcliptic(t)
	{
		var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
		var e0 = 23.0 + (26.0 + (seconds/60.0))/60.0;
		return e0;		// in degrees
	}

//***********************************************************************/
//* Name:    calcObliquityCorrection						*/
//* Type:    Function									*/
//* Purpose: calculate the corrected obliquity of the ecliptic		*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   corrected obliquity in degrees						*/
//***********************************************************************/

	function calcObliquityCorrection(t)
	{
		var e0 = calcMeanObliquityOfEcliptic(t);

		var omega = 125.04 - 1934.136 * t;
		var e = e0 + 0.00256 * Math.cos(degToRad(omega));
		return e;		// in degrees
	}

//***********************************************************************/
//* Name:    calcSunRtAscension							*/
//* Type:    Function									*/
//* Purpose: calculate the right ascension of the sun				*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun's right ascension in degrees						*/
//***********************************************************************/

	function calcSunRtAscension(t)
	{
		var e = calcObliquityCorrection(t);
		var lambda = calcSunApparentLong(t);
 
		var tananum = (Math.cos(degToRad(e)) * Math.sin(degToRad(lambda)));
		var tanadenom = (Math.cos(degToRad(lambda)));
		var alpha = radToDeg(Math.atan2(tananum, tanadenom));
		return alpha;		// in degrees
	}

//***********************************************************************/
//* Name:    calcDayOfWeek								*/
//* Type:    Function									*/
//* Purpose: Derives weekday from Julian Day					*/
//* Arguments:										*/
//*   juld : Julian Day									*/
//* Return value:										*/
//*   String containing name of weekday						*/
//***********************************************************************/

	function calcDayOfWeek(juld)
	{
		var A = (juld + 1.5) % 7;
		var DOW = (A==0)?"Sunday":(A==1)?"Monday":(A==2)?"Tuesday":(A==3)?"Wednesday":(A==4)?"Thursday":(A==5)?"Friday":"Saturday";
		return DOW;
	}

//***********************************************************************/
//* Name:    calcDayOfYear								*/
//* Type:    Function									*/
//* Purpose: Finds numerical day-of-year from mn, day and lp year info  */
//* Arguments:										*/
//*   month: January = 1								*/
//*   day  : 1 - 31									*/
//*   lpyr : 1 if leap year, 0 if not						*/
//* Return value:										*/
//*   The numerical day of year							*/
//***********************************************************************/

	function calcDayOfYear(mn, dy, lpyr) 
	{
		var k = (lpyr ? 1 : 2);
		var doy = Math.floor((275 * mn)/9) - k * Math.floor((mn + 9)/12) + dy -30;
		return doy;
	}


	function isLeapYear(yr) 
	{
		return ((yr % 4 == 0 && yr % 100 != 0) || yr % 400 == 0);
	}

// Convert degree angle to radians

	function degToRad(angleDeg) 
	{
		return (Math.PI * angleDeg / 180.0);
	}

// Convert radian angle to degrees

	function radToDeg(angleRad) 
	{
		return (180.0 * angleRad / Math.PI);
	}

//***********************************************************************/
//* Name:    calcSunDeclination							*/
//* Type:    Function									*/
//* Purpose: calculate the declination of the sun				*/
//* Arguments:										*/
//*   t : number of Julian centuries since J2000.0				*/
//* Return value:										*/
//*   sun's declination in degrees							*/
//***********************************************************************/

	function calcSunDeclination(t)
	{
		var e = calcObliquityCorrection(t);
		var lambda = calcSunApparentLong(t);

		var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
		var theta = radToDeg(Math.asin(sint));
		return theta;		// in degrees
	}

	function calcEquationOfTime(t)
	{
		var epsilon = calcObliquityCorrection(t);
		var l0 = calcGeomMeanLongSun(t);
		var e = calcEccentricityEarthOrbit(t);
		var m = calcGeomMeanAnomalySun(t);

		var y = Math.tan(degToRad(epsilon)/2.0);
		y *= y;

		var sin2l0 = Math.sin(2.0 * degToRad(l0));
		var sinm   = Math.sin(degToRad(m));
		var cos2l0 = Math.cos(2.0 * degToRad(l0));
		var sin4l0 = Math.sin(4.0 * degToRad(l0));
		var sin2m  = Math.sin(2.0 * degToRad(m));

		var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0
				- 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;

		return radToDeg(Etime)*4.0;	// in minutes of time
	}

	function calcHourAngle(time, longitude, eqtime)
	{
		return (15.0*(time - (longitude/15.0) - (eqtime/60.0)));
		// in degrees
	}


	//function calcSun(riseSetForm, latLongForm, index, index2) 
	function CalcSunPos(latitude, longitude, hh, mm, ss, year, month, day) 
	{
		// we need a single float value for long and lat
		// so if we have deg, minutes and seconds do this: decLat = degs + (mins / 60) + (secs / 3600);

		// timenow is GMT time for calculation, in hours since 0Z as float
		timenow = hh + mm/60 + ss/3600;
		//alert("timenow = " + timenow);

		var JD = (calcJD(year, month, day));
		var dow = calcDayOfWeek(JD);
		var doy = calcDayOfYear(month, day, isLeapYear(year));
		var T = calcTimeJulianCent(JD + timenow/24.0); 
		var R = calcSunRadVector(T);

		var alpha = calcSunRtAscension(T);
		var theta = calcSunDeclination(T);
		var Etime = calcEquationOfTime(T);

		var eqTime = Etime;
		var solarDec = theta; // in degrees
		var earthRadVec = R;

//		var solarTimeFix = eqTime - 4.0 * longitude;
		var solarTimeFix = eqTime + 4.0 * longitude;
		var trueSolarTime = hh * 60.0 + mm + ss/60.0 + solarTimeFix;
		// in minutes

		while (trueSolarTime > 1440)
		{
			trueSolarTime -= 1440;
		}

		//var hourAngle = calcHourAngle(timenow, longitude, eqTime);
		var hourAngle = trueSolarTime / 4.0 - 180.0;
		// Thanks to Louis Schwarzmayr for finding our error,
		// and providing the following 4 lines to fix it:
		if (hourAngle < -180) {
		  hourAngle += 360.0;
		}
		// alert ("Hour Angle = " + hourAngle);

		var haRad = degToRad(hourAngle);
		var csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(solarDec)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(solarDec)) * Math.cos(haRad);
		if (csz > 1.0) {
			csz = 1.0;
		} else if (csz < -1.0) { 
			csz = -1.0; 
		}
		var zenith = radToDeg(Math.acos(csz));
		var azDenom = ( Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)) );
		if (Math.abs(azDenom) > 0.001) {
			azRad = (( Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith)) ) - Math.sin(degToRad(solarDec))) / azDenom;
			if (Math.abs(azRad) > 1.0) {
				if (azRad < 0) {
					azRad = -1.0;
				} else {
					azRad = 1.0;
				}
			}

			var azimuth = 180.0 - radToDeg(Math.acos(azRad));

			if (hourAngle > 0.0) {
				azimuth = -azimuth;
			}
		} else {
			if (latitude > 0.0) {
				azimuth = 180.0;
			} else { 
				azimuth = 0.0;
			}
		}
		if (azimuth < 0.0) {
			azimuth += 360.0;
		}
		exoatmElevation = 90.0 - zenith;
		if (exoatmElevation > 85.0) {
			refractionCorrection = 0.0;
		} else {
			te = Math.tan (degToRad(exoatmElevation));
			if (exoatmElevation > 5.0) {
				refractionCorrection = 58.1 / te - 0.07 / (te*te*te) + 0.000086 / (te*te*te*te*te);
			} else if (exoatmElevation > -0.575) {
				refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711) ) );
			} else {
				refractionCorrection = -20.774 / te;
			}
			refractionCorrection = refractionCorrection / 3600.0;
		}

		solarZen = zenith - refractionCorrection;			
		var elevation = 90.0 - solarZen;

		// results
//		alert("azimuth=" + azimuth);
//		alert("elevation=" + elevation);
		return {azimuth:azimuth,elevation:elevation};
	}


//CalcSunPos(latitude, longitude, hh, mm, ss, year, month, day) 
//CalcSunPos(48, 16, 10, 0, 0, 2011, 5, 24);


