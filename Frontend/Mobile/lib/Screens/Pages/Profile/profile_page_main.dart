import 'package:flutter/material.dart';

import 'user_profile.dart';
import 'Sections/UserProfile/user_profile.dart';
import 'Sections/AcountDetails/account_details.dart';
import 'Sections/ChangePassword/change_password.dart';
import 'Sections/logout.dart';
import 'Sections/Salary/salary_info.dart';

import '../../../Controller/Profile/user_profile_controller.dart';

class ProfilePageMain extends StatefulWidget {
  const ProfilePageMain({super.key});

  @override
  State<ProfilePageMain> createState() => _ProfilePageMainState();
}

class _ProfilePageMainState extends State<ProfilePageMain> {
  final UserProfileController userProfile = UserProfileController();
  String name = '';
  String email = '';
  String contact = '';
  String role = '';
  String department = '';

  @override
  void initState() {
    super.initState();

    _loadData();
  }

  Future<void> _loadData() async {
    final result = await userProfile.getUserProfile();
    setState(() {
      name = result.$1;
      email = result.$2;
      contact = result.$3;
      role = result.$4;
      department = result.$5;
    });
  }

  @override
  Widget build(BuildContext context) {
    var items = SingleChildScrollView(
      child: Column(
        spacing: 20,
        children: [
          Container(), // just for the spacing
          UserProfileDetails(
            name: name,
            email: email,
            contact: contact,
            role: role,
            department: department,
          ),
          UserProfile(),
          AccountDetails(),
          SalaryInfo(),
          ChangePassword(),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [LogoutButton()],
          ),
        ],
      ),
    );
    return items;
  }
}
