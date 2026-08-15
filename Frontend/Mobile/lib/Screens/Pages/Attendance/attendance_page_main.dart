import 'package:flutter/material.dart';
import 'package:flutter_biogeohr/Controller/Attendance/attendance_model.dart';

import 'attendance.dart';
import 'monthly_attendance.dart';
import '../../../Controller/Attendance/attendance_controller.dart';
import '../../../Controller/Attendance/attendance_model.dart';

import '../../Reusable/Items/attendance_item_layout.dart';
import 'package:flutter_biogeohr/Screens/Pages/Attendance/Items/atttendance_pages.dart';

class AttendancePageMain extends StatefulWidget {
  const AttendancePageMain({super.key});

  @override
  State<AttendancePageMain> createState() => _AttendancePageMainState();
}

class _AttendancePageMainState extends State<AttendancePageMain> {
  late Future<List<AttendanceModel>> attendance;
  final AttendanceController attendanceController = AttendanceController();

  // Track the active page state
  int _currentPage = 1;
  final int _itemsPerPage = 7;

  @override
  void initState() {
    super.initState();
    attendance = attendanceController.getAttendance();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    // var items = Container(
    //   margin: EdgeInsets.all(15),
    //   child: Column(
    //     children: [MonthlyAttendance(), SizedBox(height: 15), Attendance()],
    //   ),
    // );
    var items = FutureBuilder<List<AttendanceModel>>(
      future: attendance,
      builder: (context, snapshot) {
        // Show a loader while waiting for backend response
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        // Show error if backend request fails
        if (snapshot.hasError) {
          return Center(child: Text('Error loading data: ${snapshot.error}'));
        }

        // Handle case where data returns empty
        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No attendance records found.'));
        }

        // Safely extract your loaded list of elements
        final List<AttendanceModel> records = snapshot.data!;

        // Calculate the slice of 7 records to show for the current page
        final int startIndex = (_currentPage - 1) * _itemsPerPage;
        final int endIndex = startIndex + _itemsPerPage;

        //Compute dynamic total pages based on your dataset size
        final int totalPages = (records.length / _itemsPerPage).ceil();

        //Safely extract only the records needed for this page
        final List<AttendanceModel> pageRecords = records.length > startIndex
            ? records.sublist(
                startIndex,
                endIndex > records.length ? records.length : endIndex,
              )
            : [];

        return Container(
          margin: EdgeInsets.all(15),
          child: Column(
            children: [
              //Top part the monthly attendance num
              MonthlyAttendance(),
              //spacing
              SizedBox(height: 15),

              SingleChildScrollView(
                child: Container(
                  width: 350,
                  constraints: const BoxConstraints(
                    maxHeight:
                        520, // The item block will NEVER go further than 400 pixels wide
                  ),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: Color(0xFFFCFCFC),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(20),
                        blurRadius: 6.0,
                        spreadRadius: 4.0,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    spacing: 5,
                    children: [
                      SizedBox(),
                      Container(
                        padding: EdgeInsets.all(5),
                        child: Text(
                          'All Attendance',
                          style: TextStyle(
                            fontFamily: 'Roboto',
                            color: Color(0xFF6675EC),
                            fontSize: 18.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      //line
                      Container(
                        height: 1,
                        width: 350,
                        color: Color(0xFFE0E0E0),
                      ),
                      Expanded(
                        //ITEMS
                        child: ListView.builder(
                          // padding: const EdgeInsets.all(15),
                          itemCount: pageRecords.length,
                          itemBuilder: (context, index) {
                            final record = pageRecords[index];
                            return AttendanceItemLayout(
                              status: record.status,
                              location: record.location,
                              date: record.date,
                              isVisible: false,
                              clockIn: record.clockIn,
                              clockOut: record.clockOut,
                            );
                          },
                        ),
                      ),
                      // AttendanceItems(),
                      // Spacer(),

                      // Padding(
                      // padding: const EdgeInsets.(
                      //   vertical: 10,
                      // ), // Optional padding
                      Column(
                        children: [
                          Container(
                            height: 1,
                            width: 350,
                            color: Color(0xFFE0E0E0),
                          ),
                        ],
                      ),
                      AttendancePages(
                        pageNum: _currentPage,
                        totalPages: totalPages == 0
                            ? 1
                            : totalPages, // Safely handles empty states
                        onPageChanged: (newPage) {
                          setState(() {
                            _currentPage = newPage;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
    return items;
  }
}
