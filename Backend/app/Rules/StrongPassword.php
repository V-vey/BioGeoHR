<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * The one password rule, used where an employee sets their own password: at least 8 characters
 * with an uppercase letter, a lowercase letter and a number. A symbol is allowed but not
 * required. The phone shows the same rule. (A new employee gets a generated password: generate().)
 */
class StrongPassword implements ValidationRule
{
    public const MIN_LENGTH = 8;
    public const MESSAGE = 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = (string) $value;

        $ok = mb_strlen($password) >= self::MIN_LENGTH
            && preg_match('/\p{Lu}/u', $password)
            && preg_match('/\p{Ll}/u', $password)
            && preg_match('/\d/', $password);

        if (!$ok) {
            $fail(self::MESSAGE);
        }
    }

    /**
     * A random password that always meets the rule: 10 characters, at least one uppercase letter,
     * one lowercase letter and one number. Letters and digits that look alike (O/0, I/l/1) are left
     * out, so it can be read from an email and typed on a phone without mistakes.
     */
    public static function generate(int $length = 10): string
    {
        $upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        $lower = 'abcdefghijkmnpqrstuvwxyz';
        $digits = '23456789';

        // one of each kind first, the rest from all three, then shuffled so the kinds are not in a fixed order
        $chars = [
            $upper[random_int(0, strlen($upper) - 1)],
            $lower[random_int(0, strlen($lower) - 1)],
            $digits[random_int(0, strlen($digits) - 1)],
        ];
        $all = $upper . $lower . $digits;
        while (count($chars) < max($length, self::MIN_LENGTH)) {
            $chars[] = $all[random_int(0, strlen($all) - 1)];
        }
        for ($i = count($chars) - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            [$chars[$i], $chars[$j]] = [$chars[$j], $chars[$i]];
        }

        return implode('', $chars);
    }
}
