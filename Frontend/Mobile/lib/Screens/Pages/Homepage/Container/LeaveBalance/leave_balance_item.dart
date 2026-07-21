import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
// import 'package:flutter_biogeohr/Screens/Pages/Attendance/Items/leave.dart';
import '../../../../../Controller/Homepage/leave_balance_controller.dart';

class LeaveBalanceItem extends StatelessWidget {
  final LeaveBalance leaveBalance = LeaveBalance();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(top: 5, left: 10, right: 10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,

            //Annual Leave
            children: [
              Text(
                'Annual Leave:',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0x703A3A3A),
                  fontSize: 15.0,
                ),
              ),
              FutureBuilder(
                future: leaveBalance.getBalanceLeave("annual"),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Text(
                      "...",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  } else if (!snapshot.hasData) {
                    return Text("No Data");
                  } else if (snapshot.hasError) {
                    return Text(
                      "Error",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  }

                  final data = snapshot.data!;

                  return Text(
                    data.toString(),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      color: Color(0xFF3A3A3A),
                      fontSize: 15.0,
                    ),
                  );
                },
              ),
            ],
          ),
          SizedBox(height: 5),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,

            //Sick Leave
            children: [
              Text(
                'Sick Leave:',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0x703A3A3A),
                  fontSize: 15.0,
                ),
              ),

              //Value
              FutureBuilder(
                future: leaveBalance.getBalanceLeave("sick"),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Text(
                      "...",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  } else if (!snapshot.hasData) {
                    return Text("No Data");
                  } else if (snapshot.hasError) {
                    return Text(
                      "Error",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  }

                  final data = snapshot.data!;

                  return Text(
                    data.toString(),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      color: Color(0xFF3A3A3A),
                      fontSize: 15.0,
                    ),
                  );
                },
              ),
            ],
          ),
          SizedBox(height: 5),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,

            //Paternity Leave
            children: [
              Text(
                'Paternity Leave:',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0x703A3A3A),
                  fontSize: 15.0,
                ),
              ),

              //Value
              FutureBuilder(
                future: leaveBalance.getBalanceLeave("patern"),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Text(
                      "...",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  } else if (!snapshot.hasData) {
                    return Text("No Data");
                  } else if (snapshot.hasError) {
                    return Text(
                      "Error",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  }

                  final data = snapshot.data!;

                  return Text(
                    data.toString(),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      color: Color(0xFF3A3A3A),
                      fontSize: 15.0,
                    ),
                  );
                },
              ),
            ],
          ),
          SizedBox(height: 5),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,

            //Unpaid Leave
            children: [
              Text(
                'Unpaid Leave:',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0x703A3A3A),
                  fontSize: 15.0,
                ),
              ),

              //Value
              FutureBuilder(
                future: leaveBalance.getBalanceLeave("unpaid"),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return Text(
                      "...",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  } else if (!snapshot.hasData) {
                    return Text("No Data");
                  } else if (snapshot.hasError) {
                    return Text(
                      "Error",
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF3A3A3A),
                        fontSize: 15.0,
                      ),
                    );
                  }

                  final data = snapshot.data!;

                  return Text(
                    data.toString(),
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      color: Color(0xFF3A3A3A),
                      fontSize: 15.0,
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
