// import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
// import '../../../Service/AuthStorage.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Service/Url.dart';

bool _checkPosition(statusCode) {
  if (statusCode == 200) {
    return true;
  }
  return false;
}

final url _api = url();

Future<Position> _determinePosition() async {
  bool serviceEnabled;
  LocationPermission permission;

  // 1. Test if location services are enabled.
  serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    return Future.error('Location services are disabled.');
  }

  // 2. Check current permission status.
  permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    // Prompt the user for permission.
    permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied) {
      return Future.error('Location permissions are denied.');
    }
  }

  if (permission == LocationPermission.deniedForever) {
    return Future.error('Location permissions are permanently denied.');
  }

  // 3. Fetch and return the current position.
  return await Geolocator.getCurrentPosition(
    locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
  );
}

Future<bool> verifyUserCoordinates() async {
  // try {
  Position position = await _determinePosition();

  print(position.longitude);
  print(position.latitude);
  final prefs = await SharedPreferences.getInstance();

  //access the user
  String? token = prefs.getString("token");
  String? locationName = prefs.getString("temp");

  final url = Uri.parse(_api.getGeofence());
  final response = await http.post(
    url,
    headers: {
      "Authorization": "Bearer $token",
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: jsonEncode({
      "userLong": position.longitude,
      "userLat": position.latitude,
      "locationName": locationName,
    }),
  );
  print(response.body);
  return _checkPosition(response.statusCode);
  // } catch (e) {
  //   print('Error getting location: $e');
  // }
}
