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
    return "$api/myLeaveBalance";
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

  //api for today's clock state (resume the timer after a restart)
  String todayAttendance() {
    return "$api/todayAttendance";
  }

  //api to countLate
  String countLate() {
    return "$api/countLate";
  }

  //api to countOnTime
  String countOnTime() {
    return "$api/countOnTime";
  }

  //api to countAbsent
  String countAbsent() {
    return "$api/countAbsent";
  }

  //api for RecentAttendance
  String recentAttendance() {
    return "$api/recentAttendance";
  }

  //api for user profile
  String userProfile() {
    return "$api/userProfile";
  }

  //api for attendance all
  String getAllAttendance() {
    return "$api/getAllAttendance";
  }

  //api Change Password
  String changePassword() {
    return "$api/changePassword";
  }

  String geofenceCheck() {
    return "$api/geofenceCheck";
  }

  String systemSettings() {
    return "$api/systemSettings";
  }

  //api for the latest payslip
  String getMyPayslip() {
    return "$api/myPayslip";
  }

  //api for the employee to edit their own contact, address and photo
  String updateProfile() {
    return "$api/updateProfile";
  }

  //api for the employee's own salary (Salary Info card)
  String getMySalary() {
    return "$api/mySalary";
  }

  //api for the logged-in employee's own leave requests
  String getMyLeave() {
    return "$api/myLeave";
  }

  //api to apply for leave
  String applyLeave() {
    return "$api/applyLeave";
  }
}
