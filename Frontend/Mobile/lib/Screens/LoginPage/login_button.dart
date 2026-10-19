import 'package:flutter/material.dart';
import '../../homepage.dart';
import '../../Service/dialogs.dart';

// screens get data
// import 'text_box_email.dart';
// import 'text_box_password.dart';

//process
import '../../Controller/Login/login.dart';

class Loginbutton extends StatefulWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final Logintext logintext;

  const Loginbutton({
    super.key,
    required this.emailController,
    required this.passwordController,
    required this.logintext,
  });

  @override
  State<Loginbutton> createState() => _LoginbuttonState();
}

class _LoginbuttonState extends State<Loginbutton> {
  bool _loading = false; // true while the login is being checked

  TextEditingController get emailController => widget.emailController;
  TextEditingController get passwordController => widget.passwordController;
  Logintext get logintext => widget.logintext;

  @override
  Widget build(BuildContext context) {
    var button = SizedBox(
      width: 220,
      height: 40,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Color(0xFF2AAF56), // Sets the background color
          foregroundColor: Colors.white, // Sets the text and icon color
          disabledBackgroundColor: Color(
            0xFF2AAF56,
          ), // keeps the green while logging in
          disabledForegroundColor: Colors.white,
        ),
        // null disables the button, so a second tap cannot start a second login
        onPressed: _loading
            ? null
            : () async {
                //uncomment to use login function

                setState(() => _loading = true);
                dynamic isSuccessful;
                try {
                  isSuccessful = await logintext.login(
                    emailController.text,
                    passwordController.text,
                  );
                } finally {
                  if (mounted) setState(() => _loading = false);
                }

                if (!context.mounted) return;

                if (isSuccessful["authenticated"] == "User Not Found") {
                  await showError(
                    'Invalid credential please try again.',
                    title: 'Login failed',
                  );
                  return;
                }

                if (isSuccessful["authenticated"] == "Password Incorrect") {
                  await showError(
                    'Invalid credential please try again.',
                    title: 'Login failed',
                  );
                  return;
                }

                if (isSuccessful["authenticated"] == "Account Deactivated") {
                  await showError(
                    'Your account has been deactivated. Please contact HR.',
                    title: 'Account deactivated',
                  );
                  return;
                }

                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => Homepage()),
                );

                //clear the text fields after successful login
                emailController.clear();
                passwordController.clear();
              },
        child: _loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
            : Text(
                'Log-in',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
      ),
    );
    return button;
  }
}
