import 'package:flutter/material.dart';

class UserProfileDetails extends StatelessWidget {
  const UserProfileDetails({super.key});

  @override
  Widget build(BuildContext context) {
    //data needed
    late String name = "Abdul Jackul Salsalani";
    late String email = "abdul0690@gmail.com";
    late String contact = "0961-7989-697";
    var items = Container(
      // margin: EdgeInsets.all(20),
      width: 350,

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
      child: Row(
        children: [
          //picture
          Container(
            margin: EdgeInsets.all(15),
            width: 100,
            height: 100,
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
          ),

          //User Detail
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              //Name
              Text(
                name,
                style: TextStyle(
                  color: Color(0xFF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2,
                ),
              ),

              //Email
              Text(
                email,
                style: TextStyle(
                  color: Color(0x803A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                  letterSpacing: 2,
                ),
              ),

              //contact
              Text(
                contact,
                style: TextStyle(
                  color: Color(0x803A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
    return items;
  }
}
