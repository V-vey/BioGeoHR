import 'package:flutter/material.dart';

class  Late extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(right: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assignment_late_rounded, 
            size: 70,
            color: Color(0xFFEACA3A)
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text( 'Late',
                style: TextStyle(
                  color: Color(0xFFEACA3A),
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