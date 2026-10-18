import 'package:flutter/material.dart';

import '../../../../../Controller/Profile/change_password.dart';
import '../../../../../Service/dialogs.dart';

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
                  onPressed: () async {
                    // check on the phone first, so a simple mistake needs no round trip
                    if (currentPassword.text.isEmpty) {
                      await showError(
                        'Enter your current password.',
                        title: 'Check your details',
                      );
                      return;
                    }
                    final problem = passwordProblem(newPassword.text);
                    if (problem != null) {
                      await showError(problem, title: 'Password too weak');
                      return;
                    }
                    if (newPassword.text != reTypePassword.text) {
                      await showError(
                        'The new passwords do not match.',
                        title: 'Check your details',
                      );
                      return;
                    }

                    final result = await change.changePassword(
                      currentPassword.text,
                      newPassword.text,
                      reTypePassword.text,
                    );
                    if (result.ok) {
                      currentPassword.clear();
                      newPassword.clear();
                      reTypePassword.clear();
                      await showSuccess(result.message, title: 'Password changed');
                    } else {
                      await showError(result.message, title: "Couldn't change password");
                    }
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
