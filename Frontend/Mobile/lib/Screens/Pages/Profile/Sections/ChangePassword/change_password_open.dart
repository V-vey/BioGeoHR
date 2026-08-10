import 'package:flutter/material.dart';
import 'change_password_button.dart';

class ChangePasswordOpen extends StatelessWidget {
  const ChangePasswordOpen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      spacing: 10,
      children: [
        TextFormField(
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Current Password',
            border: OutlineInputBorder(),
          ),
        ),
        TextFormField(
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'New Password',
            border: OutlineInputBorder(),
          ),
        ),
        TextFormField(
          obscureText: true,
          decoration: InputDecoration(
            labelText: 'Re-Type New Password',
            border: OutlineInputBorder(),
          ),
        ),
        Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
        ChangePasswordButton(),
      ],
    );
  }
}
