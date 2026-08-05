import 'package:flutter/material.dart';

class UserProfile extends StatelessWidget {
  const UserProfile({super.key});

  @override
  Widget build(BuildContext context) {
    var items = Container(
      width: 350,
      padding: EdgeInsets.all(10),
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
          Icon(Icons.person, size: 30),
          SizedBox(width: 10),
          Text(
            "User Profile",
            style: TextStyle(
              color: Color(0xFF3A3A3A),
              fontFamily: 'Roboto',
              fontSize: 15,
              fontWeight: FontWeight.bold,
            ),
          ),
          Spacer(),
          Icon(Icons.chevron_right, size: 30),
        ],
      ),
    );
    return items;
  }
}
