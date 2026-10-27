// What can be typed in a name or nationality box; the same rules as the server (Users::NAME_REGEX,
// Users::NATIONALITY_REGEX), which also refuses anything else.

// a name: letters (ñ and accented ones too), spaces, periods, hyphens and apostrophes
// ("Dela Cruz", "Harvey R. Tayag", "Ana-Marie", "D'Souza")
export const nameChars = (value) => value.replace(/[^\p{L}\s.'-]/gu, "");

// a nationality: letters and spaces only ("Filipino")
export const lettersOnly = (value) => value.replace(/[^\p{L}\s]/gu, "");
