import 'package:flutter/material.dart';
import '../../../../../Controller/Homepage/leave_balance.dart';
import 'balance_chip.dart';

class LeaveBalanceCompact extends StatelessWidget {
  final LeaveBalances balances;
  final VoidCallback? onTap; // e.g. open the Leave tab

  const LeaveBalanceCompact({super.key, required this.balances, this.onTap});

  @override
  Widget build(BuildContext context) {
    final types = <(String, Color, int)>[
      ('Sick', const Color(0xFFEC6668), balances.sick),
      ('Vacation', const Color(0xFF2AAF56), balances.vacation),
      ('Emergency', const Color(0xFFEC9A3A), balances.emergency),
      ('Birthday', const Color(0xFFEACA3A), balances.birthday),
      ('Solo parent', const Color(0xFF6675EC), balances.soloParent),
      ('Paternity', const Color(0xFFD4537E), balances.paternity),
      ('Maternity', const Color(0xFF9A6BD0), balances.maternity),
    ];

    // maternity (120) is left out of the total so it does not drown the rest
    final usable =
        balances.sick +
        balances.vacation +
        balances.emergency +
        balances.birthday +
        balances.soloParent +
        balances.paternity;

    return Container(
      width: double.infinity,
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Column(
              spacing: 10,
              children: [
                Row(
                  spacing: 8,
                  children: [
                    const Text(
                      'Leave Balance',
                      style: TextStyle(
                        fontFamily: 'Roboto',
                        color: Color(0xFF6675EC),
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        '$usable days left',
                        textAlign: TextAlign.end,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'Roboto',
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ],
                ),
                // a horizontal list needs a fixed height
                SizedBox(
                  height: 60,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: types.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (_, i) => BalanceChip(
                      label: types[i].$1,
                      color: types[i].$2,
                      days: types[i].$3,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
