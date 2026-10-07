import 'package:flutter/material.dart';

import 'profile_picture.dart';

class UserProfileDetails extends StatefulWidget {
  final String name;
  final String email;
  final String contact;
  final String department;
  final String position;
  final String imagePath; // "avatars/xxx.png", or '' when there is no photo
  const UserProfileDetails({
    super.key,
    required this.name,
    required this.email,
    required this.contact,
    required this.department,
    required this.position,
    this.imagePath = '',
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

      child:
          //picture
          Container(
            margin: EdgeInsets.all(15),
            width: 100,
            // the photo fills the same 100 x 100 rounded box
            child: Column(
              children: [
                ProfilePicture(imagePath: widget.imagePath), //Name
                SizedBox(height: 5),
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
                Text(
                  "${widget.department} | ${widget.position}",
                  style: TextStyle(
                    color: Color(0x803A3A3A),
                    fontFamily: 'Roboto',
                    fontSize: 15,
                    fontWeight: FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
    );
    return items;
  }
}
