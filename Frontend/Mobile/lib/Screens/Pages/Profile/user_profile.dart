import 'package:flutter/material.dart';

import '../../../Controller/Profile/user_profile_controller.dart';

class UserProfileDetails extends StatefulWidget {
  final String name;
  final String email;
  final String contact;
  final String role;
  final String department;
  const UserProfileDetails({
    super.key,
    required this.name,
    required this.email,
    required this.contact,
    required this.role,
    required this.department,
  });

  @override
  State<UserProfileDetails> createState() => _UserProfileDetailsState();
}

class _UserProfileDetailsState extends State<UserProfileDetails> {
  @override
  Widget build(BuildContext context) {
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
                widget.name,
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
                widget.email,
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
                widget.contact,
                style: TextStyle(
                  color: Color(0x803A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),

              Text(
                "${widget.role} | ${widget.department}",
                style: TextStyle(
                  color: Color(0x803A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
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
