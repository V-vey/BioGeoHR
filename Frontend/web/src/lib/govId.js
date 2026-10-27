// What can be typed in a government ID box (TIN, SSS, PhilHealth, Pag-IBIG): digits and dashes only.
// The dashes are optional; the server adds them (Users::formatGovId) and refuses a letter.
export const govIdChars = (value) => value.replace(/[^\d-]/g, "");
