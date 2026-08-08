import 'package:flutter/material.dart';
// import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';
import 'user_profile_open.dart';
import 'edit_profile_button.dart';

class UserProfile extends StatefulWidget {
  const UserProfile({super.key});

  @override
  State<UserProfile> createState() => _UserProfileState();
}

bool isVisible = false;
IconData icon = Icons.chevron_right;

class _UserProfileState extends State<UserProfile> {
  @override
  Widget build(BuildContext context) {
    var items = GestureDetector(
      onTap: () {
        setState(() {
          isVisible = !isVisible;
          icon = isVisible ? Icons.expand_more : Icons.chevron_right;
        });
      },
      child: Container(
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
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.person, size: 30),
                SizedBox(width: 10),
                Text(
                  "Personal Details",
                  style: TextStyle(
                    color: Color(0xFF3A3A3A),
                    fontFamily: 'Roboto',
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Spacer(),
                Icon(icon, size: 30),
              ],
            ),
            if (isVisible) ...[
              SizedBox(height: 5),
              Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
              UserProfileOpen(),
              Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
              EditProfileButton(),
            ],
          ],
        ),
      ),
    );
    return items;
  }
}
