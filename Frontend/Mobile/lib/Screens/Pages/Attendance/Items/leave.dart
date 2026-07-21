import 'package:flutter/material.dart';

class  Leave extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(right: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.outbox, 
            size: 70,
            color: Color(0xFF6675EC)
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text( 'Leave',
                style: TextStyle(
                  color: Color(0xFF6675EC),
                  fontFamily: 'Roboto',
                  fontSize: 18,
                  fontWeight: FontWeight.bold
                ),
              ),

              //Days
              Text('26 days',
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