import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../../Controller/Profile/update_profile.dart';
import '../../profile_picture.dart';

/// The employee edits their own contact number, address and photo.
/// Everything else on the profile (name, department, salary ...) is changed by HR.
class EditProfile extends StatefulWidget {
  final String contact;
  final String address;
  final String imagePath; // current photo ("avatars/xxx.png"), '' when none

  const EditProfile({
    super.key,
    required this.contact,
    required this.address,
    this.imagePath = '',
  });

  @override
  State<EditProfile> createState() => _EditProfile();
}

class _EditProfile extends State<EditProfile> {
  late final TextEditingController _contact = TextEditingController(
    text: widget.contact,
  );
  late final TextEditingController _address = TextEditingController(
    text: widget.address,
  );
  File? _newImage; // the photo picked just now, not saved yet
  bool _saving = false;

  // same rule as the server: digits, + - ( ) and spaces, 7 to 20 characters
  static final _phone = RegExp(r'^[0-9+\-\s()]{7,20}$');

  Future<void> _pickPhoto() async {
    // maxWidth/imageQuality keep the upload small (the server accepts up to 2 MB)
    final picked = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 1024,
      imageQuality: 85,
    );
    if (picked == null) return; // the user backed out of the gallery
    setState(() => _newImage = File(picked.path));
  }

  @override
  void dispose() {
    _contact.dispose(); // free the text controllers
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit profile')), // has the back arrow
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(15),
        child: Column(
          spacing: 15,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: SizedBox(
                  width: 100,
                  height: 100,
                  child: _newImage != null
                      ? Image.file(_newImage!, fit: BoxFit.cover)
                      : ProfilePicture(imagePath: widget.imagePath),
                ),
              ),
            ),
            TextButton.icon(
              onPressed: _saving ? null : _pickPhoto,
              icon: const Icon(Icons.photo_library),
              label: Text(_newImage == null ? 'Choose photo' : 'Change photo'),
            ),
            TextField(
              controller: _contact,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Contact number',
                border: OutlineInputBorder(),
              ),
            ),
            TextField(
              controller: _address,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Address',
                border: OutlineInputBorder(),
              ),
            ),
            ElevatedButton(
              onPressed: _saving ? null : _save,
              child: Text(_saving ? 'Saving...' : 'Save'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _save() async {
    // take these BEFORE the await: after it, `context` may no longer be valid
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);
    void say(String text) =>
        messenger.showSnackBar(SnackBar(content: Text(text)));

    // 1) check on the phone first, so a simple mistake does not need a round trip
    final contact = _contact.text.trim();
    final address = _address.text.trim();
    if (!_phone.hasMatch(contact)) {
      say('Enter a valid phone number');
      return;
    }
    if (address.isEmpty) {
      say('Enter your address');
      return;
    }

    // 2) send it; the button is disabled while waiting, so a double tap cannot send twice
    setState(() => _saving = true);
    final result = await UpdateProfile().send(
      contact: contact,
      address: address,
      image: _newImage,
    );

    if (!mounted) return; // the user left the page while waiting
    setState(() => _saving = false);

    // 3) tell them what happened (the server's own words)
    say(result.message);

    // 4) success: go back to the profile; `true` tells it to reload
    if (result.ok) navigator.pop(true);
  }
}
