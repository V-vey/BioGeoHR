class AttendanceModel {
  //Initialize the needs
  String location;
  String date;
  String status;
  String clockIn;
  String clockOut;
  // the day's hours with every clock-in session added up, in seconds (null from an older server)
  int? workedSeconds;
  AttendanceModel({
    required this.location,
    required this.date,
    required this.status,
    required this.clockIn,
    required this.clockOut,
    this.workedSeconds,
  });
  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      location: json['location']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      clockIn: json['clock_in']?.toString() ?? '',
      clockOut: json['clock_out']?.toString() ?? '',
      workedSeconds: (json['worked_seconds'] as num?)?.toInt(),
    );
  }
}

/// One page of the employee's attendance, newest day first.
class AttendancePage {
  final List<AttendanceModel> records;
  final int page; // the page these records belong to (1-based)
  final int lastPage; // how many pages there are (at least 1)
  final int total; // how many records the employee has in all

  const AttendancePage({
    required this.records,
    required this.page,
    required this.lastPage,
    required this.total,
  });
}
