// import 'package:flutter/material.dart';

// access the api
import 'dart:convert';
import 'package:http/http.dart' as http;
// import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/AuthStorage.dart';
import '../../Service/Url.dart';

class Logintext {
  late String token;
  late String userId;
  final AuthStorage authStorage = AuthStorage();
  final url api = url();
  String getToken() {
    return token;
  }

  //verify the inside of the body
  Future<bool> verifyData(dynamic data) async {
    bool auth = false;

    if (data["authenticated"] == true) {
      token = data["token"];
      userId = data["user"]["id"].toString();
      authStorage.saveUserId(userId);
      authStorage.saveToken(token);

      auth = true;
    }
    return auth;
  }

  Future<bool> login(String email, String password) async {
    final url = Uri.parse(api.getLogin());
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: jsonEncode({"email": email, "password": password}),
    );

    //response status success
    if (response.statusCode == 201) {
      bool isAuthenticated = await verifyData(jsonDecode(response.body));
      return isAuthenticated;
    }

    return false;
  }
}
