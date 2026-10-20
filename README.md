# BioGeoHR

A biometric and geo-fenced attendance and payroll system for **Capstone**.
HR staff manage employees, attendance, leave, loans, and payroll from a web admin. Employees clock in
and out from an Android app that checks their location and their fingerprint or face.

> Capstone project, developed in partnership with **Academia de Santiago of Tarlac, Inc.** This
> repository contains no employee names or records. The data in the demo seeder is made up.

## Features

**Web admin (HR)**

- Dashboard: today's attendance counts, weekly chart, calendar, employee list, flagged attendance, pending leave
- Employees: create (a random password is emailed to the employee), edit, deactivate or reactivate, reset a forgotten password, family details, government ID numbers
- Attendance: daily records, manual entry, absences created automatically for working days with no record
- Geo-fence locations: draw a fence on a map with a radius of 10 to 50 m, and review flagged out-of-boundary clock-ins
- Leave: review, approve, or reject requests, track leave balances, and reset everyone's leave credits for a new school year
- Payroll: pick a month and a half (1st to 15th, or 16th to end), preview it first (with a name search, paging, and select all), run it, then read payslips that list every deduction and the payday. Payroll report as PDF and CSV
- Loans: SSS, Pag-IBIG, Company, and Cash Advance loans, each deducted in the cutoff HR chooses, with a predicted end date
- Holidays (regular, special non-working, special working), working hours, and the school year
- Audit log of logins, check-ins, and admin actions, searchable by user name or email and filterable by category, status, and date

**Employee app (Android)**

- Clock in and out only inside the school's geo-fence, with fingerprint or face confirmation
- A running timer that pauses when you clock out and carries on when you clock in again
- Attendance history, leave balance and leave requests
- Latest payslip with earnings, deductions, and the payday, and loan balances
- Edit contact details and photo, change password

## Tech stack

| Part        | Built with                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- |
| Backend API | Laravel 12 (PHP 8.2+), Laravel Sanctum, MySQL, Pest                                           |
| Web admin   | React 19, Vite, Tailwind CSS 4, Axios, jsPDF, Turf.js (maps)                                  |
| Mobile app  | Flutter (Dart), geolocator, local_auth (biometrics), workmanager (background geo-fence check) |

## Repository layout

```
BioGeoHR/
├── Backend/            Laravel API (routes/api.php, app/, database/, tests/)
│   └── tests/Load/     JMeter load test and geo-fence accuracy test files
├── Frontend/
│   ├── web/            React admin site (src/outlet = pages, src/components, src/Modal)
│   └── Mobile/         Flutter app (lib/Screens, lib/Controller, lib/Service)
├── backup.bat          dump the database and uploaded photos into backups/
└── restore.bat         restore a dump (replaces the current database)
```

## Getting started

### Prerequisites

- [Laragon](https://laragon.org) (PHP 8.2+, MySQL, Composer), or an equivalent stack
- A current Node.js (20 or newer) and npm
- Flutter SDK, and Android Studio with an emulator or an Android phone

### 1. Backend

```bash
cd Backend
composer install
cp .env.example .env          # then edit .env (see below)
php artisan key:generate
php artisan migrate
php artisan db:seed           # the first HR account and the school settings only
php artisan serve --host=0.0.0.0 --port=8080
```

For a database full of demo data (employees, attendance, holidays, leave, payslips), use this
**instead of** `php artisan db:seed`, on a fresh database. It creates the HR account too:

```bash
php artisan migrate:fresh
php artisan db:seed --class=DemoDataSeeder
```

Create the database first (`CREATE DATABASE biogeohr_backend;`). In `.env`, set the database
(`DB_DATABASE=biogeohr_backend`, `DB_USERNAME`, `DB_PASSWORD`) and the mail settings. New employees
get their login by email, so use a real SMTP account (the example file only logs mail; for Gmail use
an app password). To put a download link in that email, set `APP_DOWNLOAD_URL`. The seeded HR
account and the demo accounts are defined in `database/seeders/`. Change their passwords for any
real use.

After pulling new changes, run `php artisan migrate` again. Newer migrations add the loan cutoff
and the absence figures on payslips.

### 2. Web admin

```bash
cd Frontend/web
npm install
npm run dev
```

The address of the API is set in two places, and they must match: `API_ORIGIN` in
`Frontend/web/src/resources/api.jsx` (used by a built site) and `API_TARGET` in
`Frontend/web/vite.config.js` (or the `VITE_API_TARGET` environment variable). `npm run dev` calls
`/api` on its own address and Vite forwards it to the API, so the login cookie stays first-party.

### 3. Mobile app

```bash
cd Frontend/Mobile
flutter pub get
flutter run
```

The address of the API is `api` in `Frontend/Mobile/lib/Service/Url.dart`. An emulator needs a
fingerprint enrolled (Settings → Security) and a fake location (Extended controls → Location) to
test clock-in. Ready-made points for the geo-fence test cases are in `Frontend/Mobile/test_locations/`.

### Pointing everything at the same server

The website, the phone, and the backend must reach each other. If you use a tunnel (ngrok or a dev
tunnel), put its address in the files above and add the website's address to
`allowed_origins` in `Backend/config/cors.php`.

## Tests

The backend tests run on a separate MySQL database so they can never touch your real data.

```sql
CREATE DATABASE biogeohr_test;
```

```bash
cd Backend
php artisan test
```

They cover payroll and loan deductions (including the loan cutoff setting), absences and holidays,
the weekend and overtime rules, the age rule for employees, password rules and resets, cookie login
and the CSRF check, the audit log and its search, and the audit entries for failed clock-ins. The test
setup refuses to run on any database other than `biogeohr_test`.

### Load and geo-fence tests

`Backend/tests/Load/` holds the Apache JMeter plans and helpers for the non-functional tests:

- `biogeohr_load.jmx` runs the clock-in load test (10 to 150 users). `run_load.cjs` runs every
  load level several times and prints the summary.
- `biogeohr_geofence_gui.jmx` and `make_geofence_points.cjs` check the geo-fence decision at known
  distances from the centre.
- `emulator_points.*` and `emulator_commands.txt` replay the same positions on an Android emulator.

The load test needs its own database. `database/seeders/LoadTestSeeder.php` creates 150 employees, one
geo-fence, and a CSV of login tokens, and it refuses to run on any database except `biogeohr_load`:

```bash
DB_DATABASE=biogeohr_load php artisan db:seed --class=LoadTestSeeder
```

See the comments at the top of `run_load.cjs` for how to start the backend against that database.

## How it works

**Payroll.** Pay is semi-monthly. Run Payroll takes a month and a half (the 1st to the 15th, or the
16th to the end), and the server refuses any other period. The 1st to 15th is paid on the 20th, and
the 16th to the end on the 5th of the next month.

- The daily rate is the monthly salary divided by 26 working days, and the hourly rate is the daily
  rate divided by 8. The backend stores working days per employee, but the website does not offer it
  for editing, so it is 26 for everyone.
- SSS, PhilHealth, and Pag-IBIG contributions are taken in full in the 1st to 15th cutoff only. BIR
  withholding tax is computed every cutoff.
- Each absent day (no approved leave, not a holiday) deducts a day's pay. Every 3 lates in a month
  deduct one day's pay.
- Saturday and Sunday are days off. Working on one earns one extra daily wage with no premium, and a
  clock-in on them is never late.
- Working on a holiday pays 200% of the daily wage on a regular holiday and 130% on a special
  non-working day. A special working day is an ordinary workday. A holiday that falls on a Saturday or
  Sunday uses the rest-day rates, 260% and 150%.
- Hours worked past the 8th are paid as overtime at the DOLE rate for that kind of day.

**Loans.** A loan is a fixed monthly deduction taken in the cutoff HR chooses for it: the 1st to the
15th, the 16th to the end (the default for a new loan), or half in each.

- An employee can have several loans, but only one active Company loan at a time.
- Company loans and Cash Advances are capped at ₱10,000 and must finish within the school year. No
  loan may need more than 36 deductions.
- The monthly deduction must fit what the chosen cutoff pays.
- If net pay cannot cover a deduction, the available amount is taken, and for SSS and Pag-IBIG loans
  the unpaid part is added to the next cutoff.
- When the balance reaches ₱0 the loan is marked Paid and the deduction stops.

**Clock-in.** The phone sends its position to the server, which checks it against the assigned
location's radius, then the employee confirms with a fingerprint or face. A GPS that is off, a failed
biometric check, or a position outside the fence is written to the audit log. A background check
flags an employee who leaves the fence while clocked in. The fingerprint or face is matched by the
phone's own operating system. BioGeoHR clocks the employee in only when the phone says it matched.

**Security.**

- The website keeps the login in an `HttpOnly`, `Secure` cookie (not readable by JavaScript). It needs
  HTTPS or `localhost`, and a request that changes data must carry an `X-Requested-With` header.
- The phone uses a bearer token.
- A login expires after 60 minutes without use (the server deletes the token). The website then
  returns to the login page, and the app shows "Session expired". The website cookie also lasts at
  most 8 hours.
- Employees set their own password with at least 8 characters, an uppercase letter, a lowercase letter,
  and a number. HR never chooses it. A forgotten password is reset by HR and emailed.
- Every sensitive action is recorded in the audit log without the secret itself.
- For a real deployment, put the API behind HTTPS. A tunnel address already provides it for testing.

## Backups

```bash
backup.bat                          # saves backups/biogeohr_<date>.sql and the uploaded photos
restore.bat backups\file.sql        # replaces the current database after you type YES
```

Both scripts use the Laragon MySQL path and the `biogeohr_backend` database. Edit the top of each
file if yours is different.

`restore.bat` overwrites the live database. To try a restore safely, load the dump into a separate
database instead and compare the record counts:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS biogeohr_restore_test"
mysql -u root biogeohr_restore_test < backups\file.sql
```

The photos in `backups/photos_<date>` are copied back by hand into `Backend/storage/app/public`.

## Team workflow

```bash
git branch -a                       # list branches
git checkout <branch>               # switch branch
git add <directory>
git commit -m "message"
git push
```

Work on your own branch and open a pull request into `main`.
