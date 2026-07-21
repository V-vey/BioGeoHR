import 'package:flutter/material.dart';

class  Absent extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(right: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.warning_rounded, 
            size: 70,
            color: Color(0xFFEC6668)
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text( 'Absent',
                style: TextStyle(
                  color: Color(0xFFEC6668),
                  fontFamily: 'Roboto',
                  fontSize: 18,
                  fontWeight: FontWeight.bold
                ),
              ),

              //Days
              Text('26 Days',
                style: TextStyle(
                  color: Color(0xFF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                ),
              ),

            ]
          )
        ]
      )
    );
  }
}