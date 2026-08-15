import 'package:flutter/material.dart';

import '../../../../../Controller/Profile/change_password.dart';

class ChangePasswordButton extends StatelessWidget {
  final TextEditingController currentPassword;
  final TextEditingController newPassword;
  final TextEditingController reTypePassword;
  const ChangePasswordButton({
    super.key,
    required this.currentPassword,
    required this.newPassword,
    required this.reTypePassword,
  });

  @override
  Widget build(BuildContext context) {
    final ChangePassword change = ChangePassword();
    return SizedBox(
      width: 350,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,

        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                height: 25,
                width: 300,
                child: ElevatedButton(
                  onPressed: () {
                    change.changePassword(
                      currentPassword.text,
                      newPassword.text,
                      reTypePassword.text,
                    );
                    print(currentPassword.text);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xBF2AAF56),
                    foregroundColor: Colors.white,
                    elevation: 0,
                  ),

                  child: Text(
                    'Change Password',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
