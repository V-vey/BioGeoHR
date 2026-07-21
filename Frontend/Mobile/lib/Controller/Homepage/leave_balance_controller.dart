import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// import '../../Service/AuthStorage.dart';
import '../../Service/Url.dart';

class LeaveBalance {
  final url api = url();

  //Type Of Leave
  getLeave(data, type) async {
    if (await type == "annual") {
      String annual = data['annual_leave'].toString();
      return annual;
    } else if (await type == 'sick') {
      String sick = data['sick_leave'].toString();
      return sick;
    } else if (await type == 'patern') {
      String patern = data['patternity_leave'].toString();
      return patern;
    } else if (await type == 'unpaid') {
      String unpaid = data['unpaid_leave'].toString();
      return unpaid;
    }
  }

  Future<dynamic> getBalanceLeave(type) async {
    //get global var
    final prefs = await SharedPreferences.getInstance();
    String? token = prefs.getString("token");
    String? userId = prefs.getString("id");

    final url = Uri.parse(api.getLeaveBalance(userId));
    final response = await http.get(
      url,
      headers: {
        "Authorization": "Bearer $token",
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode == 200) {
      return getLeave(jsonDecode(response.body), type);
    } else {
      throw Exception('Failed to load leave balance: ${response.statusCode}');
    }
  }
}
