import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';

//controller
import 'Controller/Login/login.dart';

//Login Page
import 'Screens/Reusable/TextBioGeoHR.dart';
import 'Screens/LoginPage/text_box_email.dart';
// import 'Screens/LoginPage/text_box_password.dart';
import 'Screens/LoginPage/login_button.dart';

//testin widget
import 'Testing/testing_button.dart';

final TextEditingController _emailController = TextEditingController();
final TextEditingController _passwordController = TextEditingController();
final Logintext logintext = Logintext();

class Loginpage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF2F2F2),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 13,
          children: [
            //Login Screen
            BioGeoHRLogo(textSize: 48),
            TextboxEmail(controller: _emailController),
            TextboxPassword(controller: _passwordController),
            Loginbutton(
              emailController: _emailController,
              passwordController: _passwordController,
              logintext: logintext,
            ),
            TestingButton(),
          ],
        ),
      ),
    );
  }
}
