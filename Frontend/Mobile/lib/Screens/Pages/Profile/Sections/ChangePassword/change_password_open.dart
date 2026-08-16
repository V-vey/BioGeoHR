import 'package:flutter/material.dart';
import 'change_password_button.dart';

class ChangePasswordOpen extends StatelessWidget {
  final TextEditingController currentPassword;
  final TextEditingController newPassword;
  final TextEditingController reTypePassword;
  const ChangePasswordOpen({
    super.key,
    required this.currentPassword,
    required this.newPassword,
    required this.reTypePassword,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      spacing: 10,
      children: [
        TextFormField(
          obscureText: true,
          controller: currentPassword,
          decoration: InputDecoration(
            labelText: 'Current Password',
            border: OutlineInputBorder(),
          ),
        ),
        TextFormField(
          obscureText: true,
          controller: newPassword,
          decoration: InputDecoration(
            labelText: 'New Password',
            border: OutlineInputBorder(),
          ),
        ),
        TextFormField(
          obscureText: true,
          controller: reTypePassword,
          decoration: InputDecoration(
            labelText: 'Re-Type New Password',
            border: OutlineInputBorder(),
          ),
        ),
        Container(width: 350, height: 1, color: Color(0xFFE0E0E0)),
        ChangePasswordButton(
          currentPassword: currentPassword,
          newPassword: newPassword,
          reTypePassword: reTypePassword,
        ),
      ],
    );
  }
}
