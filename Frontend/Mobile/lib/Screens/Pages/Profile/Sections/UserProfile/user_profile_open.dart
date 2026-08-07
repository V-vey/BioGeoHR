import 'package:flutter/material.dart';

class UserProfileOpen extends StatelessWidget {
  const UserProfileOpen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      padding: EdgeInsets.only(top: 10, left: 10, right: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [Text("User Info:")],
      ),
    );
  }
}
