import 'package:flutter/material.dart';
// import 'package:flutter_biogeohr/Screens/Pages/Attendance/attendance.dart';
//Reusable
import 'Screens/Reusable/Header.dart';
import 'Screens/Reusable/Navigation.dart';

//Homepage
// import 'Screens/Pages/Homepage/Container/LeaveBalance/LeaveBalance.dart';
// import 'Screens/Pages/Homepage/Container/TotalLate/TotalLate.dart';

//Pages
import 'Screens/Pages/Homepage/home_page_main.dart';
import 'Screens/Pages/Attendance/attendance_page_main.dart';
import 'Screens/Pages/Leave/LeavePageMain.dart';
import 'Screens/Pages/Profile/profile_page_main.dart';

//Global Storage
import 'Service/AuthStorage.dart';

class Homepage extends StatefulWidget {
  const Homepage({super.key});

  @override
  State<Homepage> createState() => _HomepageState();
}

class _HomepageState extends State<Homepage> {
  final AuthStorage authStorage = AuthStorage();

  //index of the current page
  int _currentIndex = 0;

  //manage the switching pages
  final PageController _pageController = PageController();

  //The Tabs in Navigation
  final List<Widget> _widgetList = [
    HomePageMain(),
    AttendancePageMain(),
    LeavePageMain(),
    ProfilePageMain(),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color.fromARGB(255, 252, 252, 252),
      appBar: const Header(),

      //what it shows
      body: PageView(
        controller: _pageController,
        physics:
            const NeverScrollableScrollPhysics(), // just the physical controller to never swipe to the next page maybe should I???
        children: _widgetList,
      ),

      //the navigation
      bottomNavigationBar: Container(
        //design
        decoration: BoxDecoration(
          color: Colors.white, // back culur
          //shadow ATOMIC
          boxShadow: [
            BoxShadow(
              color: Color(0x30000000), // CULUR sadow
              blurRadius: 12.0, // Softness :)
              spreadRadius: 3.0, // Thick!!! of the shadow
              // Pushes shadow UP into the body screen
              offset: const Offset(0, -4),
            ),
          ],
        ),

        //main navigation it calls the Reusable navigation.dart
        child: Navigation(
          myIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
            //jump to the index page
            _pageController.jumpToPage(index);
          },
        ),
      ),
    );
  }
}
