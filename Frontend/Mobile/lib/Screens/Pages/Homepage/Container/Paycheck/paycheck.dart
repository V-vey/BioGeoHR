import 'package:flutter/material.dart';

class Paycheck extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      height: 55,
      decoration: BoxDecoration( 
        borderRadius: BorderRadius.circular(10),
        color: Color(0xFFFCFCFC),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 4.0,
            offset: const Offset(0, 2)
          )
        ]
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Paycheck:',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0xFF6675EC),
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,  
                ),
              ),
            Text(
              '15,000',
              style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0xFF6675EC),
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,  
                ),
            ) 
          ],
        ),
      )
    );
  }
}