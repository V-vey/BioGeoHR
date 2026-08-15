import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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
  String name = '----------';
  String email = '----------';
  String contact = '----------';
  String department = '----------';
  String position = '----------';
  String dateOfBirth = '----------';
  String gender = '----------';
  String nationality = '----------';
  String address = '----------';
  String createdAt = '----------';
  String updatedAt = '----------';

  //final Logintext logintext = Logintext();

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
      department = result.$4;
      position = result.$5;

      // Birth Day
      DateTime parsedDateOfBirth = DateTime.parse(result.$6);
      dateOfBirth = DateFormat('MMMM d, yyyy').format(parsedDateOfBirth);

      gender = result.$7;
      nationality = result.$8;
      address = result.$9;

      // Created At
      DateTime parsedCreatedAt = DateTime.parse(result.$10);
      createdAt = DateFormat('MMMM d, yyyy').format(parsedCreatedAt);

      // Updated At
      DateTime parsedUpdatedAt = DateTime.parse(result.$11);
      updatedAt = DateFormat('MMMM d, yyyy').format(parsedUpdatedAt);
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
            department: department,
            position: position,
          ),
          UserProfile(
            name: name,
            dateOfBirth: dateOfBirth,
            gender: gender,
            nationality: nationality,
            address: address,
            contact: contact,
            email: email,
          ),
          AccountDetails(
            createdAt: createdAt,
            updatedAt: updatedAt,
            lastLogin: "SOON",
            accountStatus: "SOON",
          ),
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
