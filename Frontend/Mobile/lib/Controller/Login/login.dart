// import 'package:flutter/material.dart';

// access the api
import 'dart:convert';
import 'package:http/http.dart' as http;
// import 'package:shared_preferences/shared_preferences.dart';
import '../../Service/auth_storage.dart';
import '../../Service/url.dart';

class Logintext {
  late String token;
  late String userId;
  final AuthStorage authStorage = AuthStorage();
  final Url api = Url();
  String getToken() {
    return token;
  }

  //verify the inside of the body
  void verifyData(dynamic data) async {
    if (data["authenticated"] == "Log in Success") {
      token = data["token"];
      userId = data["user"]["id"].toString();
      authStorage.saveUserId(userId);
      authStorage.saveToken(token);
    }
  }

  Future<dynamic> login(String email, String password) async {
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
      verifyData(jsonDecode(response.body));
      return jsonDecode(response.body);
    }

    return jsonDecode(response.body);
  }
}
