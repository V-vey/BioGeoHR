import 'package:flutter/material.dart';

class Navigation extends StatelessWidget {
  final ValueChanged<int> onTap;
  final int myIndex;
  const Navigation({super.key, required this.onTap, required this.myIndex});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      onTap: onTap,
      currentIndex: myIndex,
      type: BottomNavigationBarType.shifting,
      unselectedItemColor: Color(0xFF6675EC),
      selectedItemColor: Color(0xFF6675EC),
      selectedLabelStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: Color(0xFF6675EC),
      ),
      unselectedLabelStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: Color(0xFF6675EC),
      ),
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_month),
          label: 'Attendance',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.outbox_rounded),
          label: 'Leave',
        ),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
      ],
    );
  }
}
