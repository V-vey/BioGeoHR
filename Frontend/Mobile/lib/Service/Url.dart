class url {
  final String api = 'http://192.168.254.104:8080/api';

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
  String getLeaveBalance(userId) {
    return "$api/balance/$userId";
  }

  //api for geofence calculation
  String getGeofence() {
    return "$api/geofence";
  }

  //api to save attendance
  String postAttendance() {
    return "$api/attendance";
  }
}
