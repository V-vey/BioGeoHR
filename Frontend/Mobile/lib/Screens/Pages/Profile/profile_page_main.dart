import 'package:flutter/material.dart';

import 'user_profile.dart';
import 'Sections/UserProfile/user_profile.dart';
import 'Sections/AcountDetails/account_details.dart';
import 'Sections/ChangePassword/change_password.dart';
import 'Sections/logout.dart';
import 'Sections/Salary/salary_info.dart';

class ProfilePageMain extends StatelessWidget {
  const ProfilePageMain({super.key});
  @override
  Widget build(BuildContext context) {
    var items = SingleChildScrollView(
      child: Column(
        spacing: 20,
        children: [
          Container(), // just for the spacing
          UserProfileDetails(),
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
