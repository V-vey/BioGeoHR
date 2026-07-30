import 'package:flutter/material.dart';

import 'user_profile.dart';
import 'Sections/user_profile.dart';
import 'Sections/change_password.dart';
import 'Sections/logout.dart';

class ProfilePageMain extends StatelessWidget {
  const ProfilePageMain({super.key});
  @override
  Widget build(BuildContext context) {
    var items = Column(
      children: [
        UserProfileDetails(),
        UserProfile(),
        ChangePassword(),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [LogoutButton()],
        ),
      ],
    );
    return items;
  }
}
