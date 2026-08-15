class AttendanceModel {
  //Initialize the needs
  String location;
  String date;
  String status;
  String clockIn;
  String clockOut;
  AttendanceModel({
    required this.location,
    required this.date,
    required this.status,
    required this.clockIn,
    required this.clockOut,
  });
  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      location: json['location']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      clockIn: json['clock_in']?.toString() ?? '',
      clockOut: json['clock_out']?.toString() ?? '',
    );
  }
}
