import 'package:flutter/material.dart';
import '../../../../Reusable/TextBioGeoHR.dart';

class Welcome extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      padding: EdgeInsets.symmetric(vertical: 25),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Color(0xFFFCFCFC),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 4.0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 55),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  "Welcome To",
                  style: TextStyle(
                    fontFamily: 'Roboto',
                    fontSize: 30,
                    color: Color(0xFF3A3A3A),
                  ),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [BioGeoHRLogo(textSize: 30)],
            ),
          ],
        ),
      ),
    );
  }
}
