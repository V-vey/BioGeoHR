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
  String imagePath = ''; // the photo, '' = none
  String lastLogin = '----------';
  String accountStatus = '----------';

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

      imagePath = result.$12;

      // Last login ('' = this is the first login ever)
      lastLogin = result.$13.isEmpty
          ? 'First login'
          : DateFormat(
              'MMM d, yyyy h:mm a',
            ).format(DateTime.parse(result.$13).toLocal());

      accountStatus = result.$14 ? 'Active' : 'Deactivated';
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
            imagePath: imagePath,
          ),
          UserProfile(
            name: name,
            dateOfBirth: dateOfBirth,
            gender: gender,
            nationality: nationality,
            address: address,
            contact: contact,
            email: email,
            imagePath: imagePath,
            onSaved: _loadData, // reload after the employee edits their profile
          ),
          AccountDetails(
            createdAt: createdAt,
            updatedAt: updatedAt,
            lastLogin: lastLogin,
            accountStatus: accountStatus,
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
