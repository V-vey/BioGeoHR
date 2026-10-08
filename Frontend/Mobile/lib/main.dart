import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Screens/LoginPage/text_box_password.dart';

//controller
import 'Controller/Login/login.dart';

//Login Page
import 'Screens/Reusable/text_biogeohr.dart';
import 'Screens/LoginPage/text_box_email.dart';
// import 'Screens/LoginPage/text_box_password.dart';
import 'Screens/LoginPage/login_button.dart';

import 'package:workmanager/workmanager.dart';
import 'Controller/Homepage/ClockIn/geofence_periodic_check.dart';
//testin widget
import 'Testing/testing_button.dart';

import 'package:http/http.dart' as http;
import 'package:http/io_client.dart';
import 'Service/session_client.dart';

final TextEditingController _emailController = TextEditingController();
final TextEditingController _passwordController = TextEditingController();
final Logintext logintext = Logintext();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Workmanager().initialize(callbackDispatcher);

  http.runWithClient(
    () => runApp(
      MaterialApp(
        navigatorKey: navigatorKey,
        scaffoldMessengerKey: messengerKey,
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
    ),
    () => SessionClient(IOClient()),
  );
}
