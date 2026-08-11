// ignore_for_file: file_names

class Url {
  final String api = 'https://froth-limes-skid.ngrok-free.dev/api';

  //api for login
  String getLogin() {
    return "$api/login";
  }

  //api for Logout
  String getLogout() {
    return "$api/logout";
  }

  //api for location
  String getLocations() {
    return "$api/location";
  }

  //api for leavebalance
  String getLeaveBalance() {
    return "$api/balance";
  }

  //api for geofence calculation
  String getGeofence() {
    return "$api/geofence";
  }

  //api to save attendance
  String postAttendance() {
    return "$api/attendance";
  }

  //api to ClockIn
  String clockIn() {
    return "$api/clockIn";
  }

  //api to ClockIn
  String clockOut() {
    return "$api/clockOut";
  }

  //api to countLate
  String countLate() {
    return "$api/countLate";
  }

  //api for RecentAttendance
  String recentAttendance() {
    return "$api/recentAttendance";
  }

  //api for user profile
  String userProfile() {
    return "$api/userProfile";
  }
}
