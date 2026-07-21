import 'package:flutter/material.dart';

// ignore: must_be_immutable
class LeaveBadge extends StatelessWidget {
  final String status;
  LeaveBadge({super.key, required this.status});

  late var designBack;
  late var designCircle;

  void statusCheck() {
    if (status == "Approved") {
      designBack = Color(0x302AAF56);
      designCircle = Color(0xFF2AAF56);
    } else if (status == "Pending") {
      designBack = Color(0x30EACA3A);
      designCircle = Color(0xFFEACA3A);
    } else if (status == "Reject") {
      designBack = Color(0x30EC6668);
      designCircle = Color(0xFFEC6668);
    }
  }

  @override
  Widget build(BuildContext context) {
    this.statusCheck();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: designBack,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            status, //Status
            style: TextStyle(
              fontFamily: 'Roboto',
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: Color(0x993A3A3A),
            ),
          ),
          Row(
            children: [
              SizedBox(width: 5),
              Container(
                width: 13,
                height: 13,
                decoration: BoxDecoration(
                  color: designCircle,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
