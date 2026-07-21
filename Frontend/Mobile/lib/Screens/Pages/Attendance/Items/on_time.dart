import 'package:flutter/material.dart';

class  OnTime extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(right: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.alarm, 
            size: 70,
            color: Color(0xFF2AAF56)
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text( 'On-Time',
                style: TextStyle(
                  color: Color(0xFF2AAF56),
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