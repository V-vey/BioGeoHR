import 'package:flutter/material.dart';
import '../../../../Controller/Homepage/leave_balance.dart';
import 'leave_balance_item.dart';

class LeaveBalancePanel extends StatelessWidget {
  final LeaveBalances balances;
  final VoidCallback? onApply;

  const LeaveBalancePanel({super.key, required this.balances, this.onApply});

  @override
  Widget build(BuildContext context) {
    // maternity (120) is left out of the total so it does not drown the rest
    final usable =
        balances.sick +
        balances.vacation +
        balances.emergency +
        balances.birthday +
        balances.soloParent +
        balances.paternity;

    return Container(
      width: double.infinity, // the full width
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: const Color(0xFFFCFCFC),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 6.0,
            spreadRadius: 4.0,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        spacing: 10,
        children: [
          // header
          Row(
            spacing: 8,
            children: [
              const Text(
                'Leave Balance',
                style: TextStyle(
                  fontFamily: 'Roboto',
                  color: Color(0xFF6675EC),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),

          // total + apply button
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF6675EC),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              spacing: 8,
              children: [
                Expanded(
                  // wraps on narrow phones
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Days you can still use',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      Text(
                        '$usable',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'not counting maternity leave',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                InkWell(
                  onTap: onApply,
                  borderRadius: BorderRadius.circular(999),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Text(
                      'Apply for leave',
                      style: TextStyle(color: Colors.white, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // the 7 types: pairs of Expanded cards, so each is half the width on any phone
          Row(
            spacing: 10,
            children: [
              Expanded(
                child: BalanceCard(
                  label: 'Sick',
                  icon: Icons.medical_services_outlined,
                  color: const Color(0xFFEC6668),
                  days: balances.sick,
                ),
              ),
              Expanded(
                child: BalanceCard(
                  label: 'Vacation',
                  icon: Icons.beach_access_outlined,
                  color: const Color(0xFF2AAF56),
                  days: balances.vacation,
                ),
              ),
            ],
          ),
          Row(
            spacing: 10,
            children: [
              Expanded(
                child: BalanceCard(
                  label: 'Emergency',
                  icon: Icons.warning_amber_rounded,
                  color: const Color(0xFFEC9A3A),
                  days: balances.emergency,
                ),
              ),
              Expanded(
                child: BalanceCard(
                  label: 'Birthday',
                  icon: Icons.cake_outlined,
                  color: const Color(0xFFEACA3A),
                  days: balances.birthday,
                ),
              ),
            ],
          ),
          Row(
            spacing: 10,
            children: [
              Expanded(
                child: BalanceCard(
                  label: 'Solo parent',
                  icon: Icons.family_restroom,
                  color: const Color(0xFF6675EC),
                  days: balances.soloParent,
                ),
              ),
              Expanded(
                child: BalanceCard(
                  label: 'Paternity',
                  icon: Icons.child_friendly,
                  color: const Color(0xFFD4537E),
                  days: balances.paternity,
                ),
              ),
            ],
          ),
          // maternity: full width
          BalanceCard(
            label: 'Maternity',
            icon: Icons.favorite_border,
            color: const Color(0xFF9A6BD0),
            days: balances.maternity,
          ),
        ],
      ),
    );
  }
}
