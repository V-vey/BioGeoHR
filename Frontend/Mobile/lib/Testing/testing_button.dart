import 'package:flutter/material.dart';
// import 'TestingScreen.dart';
import '../Controller/Login/login.dart';
import '../homepage.dart';
import '../Service/auth_storage.dart';
import '../Service/dialogs.dart';

class TestingButton extends StatelessWidget {
  final Logintext logintext = Logintext();
  final AuthStorage authStorage = AuthStorage();

  TestingButton({super.key});
  @override
  Widget build(BuildContext context) {
    var button = SizedBox(
      width: 220,
      height: 40,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Color(0xFF2AAF56), // Sets the background color
          foregroundColor: Colors.white, // Sets the text and icon color
        ),
        onPressed: () async {
          //just to access easily
          //remove when at home
          // Navigator.push(
          //   context,
          //   MaterialPageRoute(builder: (context) => Homepage()),
          // );
          dynamic isSuccessful = await logintext.login(
            "hr@biogeohr.test",
            "password123",
          );

          if (!context.mounted) return;

          if (isSuccessful["authenticated"] == "User Not Found") {
            await showError(
              'Please check your email and try again.',
              title: 'Login failed',
            );
            return;
          }

          if (isSuccessful["authenticated"] == "Password Incorrect") {
            await showError(
              'Please check your password and try again.',
              title: 'Login failed',
            );
            return;
          }

          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => Homepage()),
          );
        },
        child: Text(
          'Testing',
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
