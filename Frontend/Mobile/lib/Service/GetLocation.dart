// access the api
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../Service/Url.dart';

class GetLocation {
  final url api = url();
  Future<List<String>> getLocation() async {
    //access API
    final url = Uri.parse(api.getLocations());
    final response = await http.get(url);

    //Debug
    print("Server Response Status Code: ${response.statusCode}");
    print("Server Response Body: ${response.body}");

    //Making List
    List<dynamic> data = jsonDecode(response.body);
    List<String> names = data
        .map((item) => item['name']?.toString() ?? 'Unknown')
        .toList();

    return names;
  }
}
