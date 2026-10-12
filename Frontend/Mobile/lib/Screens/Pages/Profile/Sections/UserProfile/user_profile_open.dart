import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../../Controller/Profile/user_profile_controller.dart';

class UserProfileOpen extends StatelessWidget {
  final String name;
  final String dateOfBirth;
  final String gender;
  final String nationality;
  final String address;
  final String contact;
  final String email;
  // the government numbers HR saved; '' shows "Not set"
  final List<FamilyMember> family; // spouse and children
  final String employmentStatus; // Contractual or Permanent
  final String tin;
  final String sssNumber;
  final String philhealthNumber;
  final String pagibigNumber;

  const UserProfileOpen({
    super.key,
    this.family = const [],
    this.employmentStatus = '',
    this.tin = '',
    this.sssNumber = '',
    this.philhealthNumber = '',
    this.pagibigNumber = '',
    required this.name,
    required this.dateOfBirth,
    required this.gender,
    required this.nationality,
    required this.address,
    required this.contact,
    required this.email,
  });

  // "Ana Cruz, Mar 4, 1990" (just the name when the birthday was left blank)
  String _familyText(FamilyMember m) {
    if (m.birthday.isEmpty) return m.name;
    try {
      return '${m.name}, ${DateFormat('MMM d, yyyy').format(DateTime.parse(m.birthday))}';
    } catch (_) {
      return m.name;
    }
  }

  // one "Label:  value" line, in the same style as the others
  Widget _row(String label, String value) {
    const style = TextStyle(
      color: Color(0xBF3A3A3A),
      fontFamily: 'Roboto',
      fontSize: 15,
      fontWeight: FontWeight.normal,
    );
    return Row(
      children: [
        Text(label, style: style),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            value.isEmpty ? 'Not set' : value,
            textAlign: TextAlign.end,
            style: style,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      padding: EdgeInsets.all(10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 5,
        children: [
          Row(
            children: [
              Text(
                "Full Name:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                name,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Date of Birth:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                dateOfBirth,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Gender:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                gender,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Nationality:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                nationality,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Address:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                address,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Phone Number:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                contact,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Text(
                "Email:",
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
              Spacer(),
              Text(
                email,
                style: TextStyle(
                  color: Color(0xBF3A3A3A),
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  fontWeight: FontWeight.normal,
                ),
              ),
            ],
          ),
          _row('Employment Status:', employmentStatus),
          _row('TIN:', tin),
          _row('SSS No.:', sssNumber),
          _row('PhilHealth No.:', philhealthNumber),
          _row('Pag-IBIG No.:', pagibigNumber),
          // the family, one line each: "Spouse:  Ana Cruz, Mar 4, 1990"
          if (family.isEmpty)
            _row('Family:', '')
          else
            for (final m in family) _row('${m.relationship}:', _familyText(m)),
        ],
      ),
    );
  }
}
