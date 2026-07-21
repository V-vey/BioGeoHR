import 'package:flutter/material.dart';

class LateCircle extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    int val = 1; // value of the progression of the late
    //SOON The Circle Should be an arc
    return SizedBox(
      height: 110,
      width: 110,
      child: Stack(
        children: [
          //Indicator
          Container(
            width: 110,
            height: 110,
            padding: EdgeInsets.all(10),
            child: CircularProgressIndicator(
              color: Color(0x30EACA3A),
              value: 3 / 3,
              strokeWidth: 5,
            ),
          ),
          //Progression
          Container(
            width: 110,
            height: 110,
            padding: EdgeInsets.all(10),
            child: CircularProgressIndicator(
              color: Color(0xFFEACA3A),
              value: val / 3,
              strokeWidth: 5,
            ),
          ),
          Center(
            child: Text(
              "$val / 3",
              style: TextStyle(
                fontFamily: 'Roboto',
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
