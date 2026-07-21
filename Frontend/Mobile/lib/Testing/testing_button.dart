import 'package:flutter/material.dart';
// import 'TestingScreen.dart';
import '../Controller/Login/login.dart';
import '../homepage.dart';
import '../Service/AuthStorage.dart';

class TestingButton extends StatelessWidget {
  final Logintext logintext = Logintext();
  final AuthStorage authStorage = AuthStorage();
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
          bool isSuccessful = await logintext.login("test@example.com", "test");

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
