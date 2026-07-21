import 'dart:convert';
import 'package:http/http.dart' as http;

class EmployeeService {
  Future<List<dynamic>> getEmployees() async {
    final response = await http.get(
      Uri.parse('http://192.168.100.8:8080/api/users'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }

    throw Exception('Failed to load employees');
  }
}