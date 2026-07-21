import 'package:flutter/material.dart';

class BioGeoHRLogo extends StatelessWidget {
  final double textSize; 
  const BioGeoHRLogo({
    super.key,
    required this.textSize,
    });

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: 'BioGeo',
            style: TextStyle(
              fontFamily: 'Roboto',
              fontSize: textSize,
              fontWeight: FontWeight.bold,
              color: Color(0xFF2AAF56),
              
              decorationColor: Color(0xFF6675EC),
            ),
          ),
          TextSpan(
            text: 'HR',
            style: TextStyle(
              fontFamily: 'Roboto',
              fontSize: textSize,
              fontWeight: FontWeight.bold,
              color: Color(0xFF6675EC),
              // decoration: TextDecoration.underline,
            ),
          ),
        ],
      ),
    );
  }
}