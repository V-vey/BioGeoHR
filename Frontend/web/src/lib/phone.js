// A Philippine mobile number, the same rule as the server (Users::PHONE_REGEX / formatPhone):
// 0917 123 4567, 09171234567, 0917-123-4567, +63 917 123 4567 or 639171234567.
// The server saves every one of them as 09171234567.

// for <input pattern>: the browser refuses anything else when the form is sent
export const PH_PHONE_PATTERN =
  "(?:\\+?63|0)\\s?9\\d{2}[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}";

export const PH_PHONE_TITLE =
  "A Philippine mobile number, for example 0917 123 4567 or +63 917 123 4567";

// what can be typed at all: digits, a leading +, spaces and dashes
export const phoneChars = (value) => value.replace(/[^\d+\s-]/g, "").replace(/(?!^)\+/g, "");
