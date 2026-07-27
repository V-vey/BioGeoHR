import 'package:flutter/material.dart';

import '../../../Service/Url.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class CountLate {
  final url _api = url();

  Future<int> countLates() async {
    final url = Uri.parse(_api.countLate());
    final prefs = await SharedPreferences.getInstance();
    //access the user
    String? token = prefs.getString("token");
    String? userId = prefs.getString('id');

    final response = await http.post(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: jsonEncode({"user_id": userId}),
    );
    Map<String, dynamic> jsonResponse = await jsonDecode(response.body);
    int data = jsonResponse["message"];
    return data;
    // return jsonResponse["message"].toString();
  }
}
