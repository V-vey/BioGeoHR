import 'package:flutter/material.dart';
// import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';
import 'user_profile_open.dart';
import 'edit_profile_button.dart';

class UserProfile extends StatefulWidget {
  String name;
  String dateOfBirth;
  String gender;
  String nationality;
  String address;
  String contact;
  String email;
  UserProfile({
    super.key,
    required this.name,
    required this.dateOfBirth,
    required this.gender,
    required this.nationality,
    required this.address,
    required this.contact,
    required this.email,
  });

  @override
  State<UserProfile> createState() => _UserProfileState();
}

bool isVisible = false;
IconData icon = Icons.chevron_right;

class _UserProfileState extends State<UserProfile> {
  @override
  Widget build(BuildContext context) {
    var items = Stack(
      children: [
        Container(
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

                  Icon(icon),
                ],
              ),
              if (isVisible) ...[
                SizedBox(height: 5),
                Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
                UserProfileOpen(
                  name: widget.name,
                  dateOfBirth: widget.dateOfBirth,
                  gender: widget.gender,
                  nationality: widget.nationality,
                  address: widget.address,
                  contact: widget.contact,
                  email: widget.email,
                ),
                Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
                EditProfileButton(),
              ],
            ],
          ),
        ),

        //clikable Container to open
        GestureDetector(
          onTap: () {
            setState(() {
              isVisible = !isVisible;
              icon = isVisible ? Icons.expand_more : Icons.chevron_right;
            });
          },
          child: Container(width: 350, height: 50, color: Color(0x00000000)),
        ),
      ],
    );
    return items;
  }
}
