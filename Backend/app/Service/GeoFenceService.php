<?php

namespace App\Service;

class GeoFenceService
{
    //getting radian
    function radianCal($item){
        $computation = $item * (M_PI / 180);
        return $computation;
    }
    function calculateDistance($lat1, $long1, $lat2, $long2){   
        
        // latitude and longitude 1 is the center of the geofence
        // latitude and longitude 2 is the location of the employee
        $earthRadius = 6371000; // in meters
        $earthRadiusKm = $earthRadius / 1000; // in Km
        $items = [$lat1, $long1, $lat2, $long2]; 

        //converting to radian
        for ($i = 0; $i<count($items); $i++){
            $items[$i] = $this->radianCal($items[$i]);
        }

        //difference
        $latDiff = $items[2] - $items[0];
        $longDiff = $items[3] - $items[1];

        //dividing 2
        $divLat = $latDiff / 2;
        $divLong = $longDiff / 2;

        //sin^2
        $sin2lat = sin($divLat) *  sin($divLat);
        $sin2long = sin($divLong) * sin($divLong);

        //cos
        $coslat1 = cos($items[0]);
        $coslat2 = cos($items[2]);

        //sin2(difference of latitude/2) + cos(center latitude) * cos(user latitude) * sin2(difference of longitude/2)
        $formula = $sin2lat + ($coslat1 * $coslat2 * $sin2long);

        //sqrt of the formula
        $sqrtFormula = sqrt($formula);

        $arcsin = asin($sqrtFormula);

        $twoR = 2 * $earthRadius; // change if its km or meter

        $finalFormula = $twoR * $arcsin;
        return $finalFormula;
        
    }
}