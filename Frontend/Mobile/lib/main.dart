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

void main() async {
  runApp(
    MaterialApp(
      theme: ThemeData(fontFamily: 'Roboto'),
      home: Scaffold(
        backgroundColor: Color(0xFFF2F2F2),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 13,
            children: [
              //Login Screen
              BioGeoHRLogo(textSize: 48), // the logo
              // typable text
              TextboxEmail(controller: _emailController),

              // typable password
              TextboxPassword(controller: _passwordController),

              //THE Button
              Loginbutton(
                emailController: _emailController,
                passwordController: _passwordController,
                logintext: logintext,
              ),

              //JUST MEHH TESTING auto login to test@example.com user
              TestingButton(),
            ],
          ),
        ),
      ),
    ),
  );
}
