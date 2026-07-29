import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  //Save the bool if its running
  Future<void> saveTime(bool isRunning) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool("isRunning", isRunning);
  }

  //to check is its start or not the timer
  Future<bool?> getTime() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool("isRunning");
  }

  //Save Temporary Storage
  Future<void> saveTemp(String temp) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("temp", temp);
  }

  // Get Tempory Storage
  Future<String?> getTemp() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("temp");
  }

  // Remove Temporary Variable
  Future<void> removeTemp() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("temp");
  }

  // Save UserID
  Future<void> saveUserId(String id) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("id", id);
  }

  // Get UserID
  Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("id");
  }

  // Delete UserId
  Future<void> removeUserId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("id");
  }

  // Save token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("token", token);
  }

  // Get token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString("token");
  }

  // Delete token
  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove("token");
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey("token");
  }
}
