import 'package:flutter/material.dart';
import 'edit_profile.dart';

class EditProfileButton extends StatelessWidget {
  final String contact;
  final String address;
  final String imagePath;
  final VoidCallback? onSaved; // called after a successful save, so the profile reloads

  const EditProfileButton({
    super.key,
    required this.contact,
    required this.address,
    this.imagePath = '',
    this.onSaved,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 350,
      padding: EdgeInsets.only(top: 10, left: 10, right: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 5,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                height: 25,
                width: 300,
                child: ElevatedButton(
                  onPressed: () async {
                    final saved = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => EditProfile(
                          contact: contact,
                          address: address,
                          imagePath: imagePath,
                        ),
                      ),
                    );
                    if (saved == true) onSaved?.call();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xBF2AAF56),
                    foregroundColor: Colors.white,
                    elevation: 0,
                  ),

                  child: Text(
                    'Edit Profile',
                    style: TextStyle(
                      fontFamily: 'Roboto',
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
