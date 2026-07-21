import 'package:flutter/material.dart';
import '../../../homepage.dart';

// screens get data
// import 'text_box_email.dart';
// import 'text_box_password.dart';

//process
import '../../Controller/Login/login.dart';

class Loginbutton extends StatelessWidget {
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
          //uncomment to use login function

          bool isSuccessful = await logintext.login(
            emailController.text,
            passwordController.text,
          );

          if (!context.mounted) return;

          if (isSuccessful) {
            // Login successful, navigate to the next screen
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => Homepage()),
            );
          } else {
            // Login failed, show an error message
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Login failed. Please check your credentials.'),
              ),
            );
          }
        },
        child: Text(
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
