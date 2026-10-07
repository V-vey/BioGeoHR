import 'package:flutter/material.dart'; // LeaveBalances

class BalanceCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final int days;

  const BalanceCard({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.days,
  });
  @override
  Widget build(BuildContext context) {
    final empty = days == 0;
    final accent = empty ? Colors.grey : color;
    final unit = empty ? ' none left' : (days == 1 ? ' day' : ' days');

    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: empty ? const Color(0xFFF2F2F2) : const Color(0xFFFCFCFC),
          border: Border.all(color: const Color(0xFFE6E6E6)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(width: 4, color: accent), // the colour stripe
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        spacing: 6,
                        children: [
                          Icon(icon, size: 16, color: accent),
                          Text(
                            label,
                            style: TextStyle(
                              fontFamily: 'Roboto',
                              fontSize: 12,
                              color: empty
                                  ? Colors.grey
                                  : const Color(0xFF3A3A3A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text.rich(
                        TextSpan(
                          children: [
                            TextSpan(
                              text: '$days',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: empty
                                    ? Colors.grey
                                    : const Color(0xFF3A3A3A),
                              ),
                            ),
                            TextSpan(
                              text: unit,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                        style: const TextStyle(fontFamily: 'Roboto'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
