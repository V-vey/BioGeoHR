# BioGeoHR

A biometric and geo-fenced attendance and payroll system for **Capstone**.
HR staff manage employees, attendance, leave, loans, and payroll from a web admin. Employees clock in
and out from an Android app that checks their location and their fingerprint or face.

> Capstone project. The data in the demo seeder is made up.

## Features

**Web admin (HR)**

- Dashboard: today's attendance counts, weekly chart, calendar, employee list, flagged attendance, pending leave
- Employees: create (a random password is emailed to the employee), edit, deactivate or reactivate, reset a forgotten password, family details, government ID numbers
- Attendance: daily records, manual entry, absences created automatically for working days with no record
- Geo-fence locations: draw a fence on a map with a radius of 10 to 50 m, and review flagged out-of-boundary clock-ins
- Leave: review, approve, or reject requests, and track leave balances
- Payroll: run payroll for a cutoff (with a preview first), payslips, payroll report (PDF and CSV), government contributions and tax
- Loans: SSS, Pag-IBIG, Company, and Cash Advance loans, with a predicted end date
- Holidays, working hours, and the school year
- Audit log of logins, check-ins, and admin actions

**Employee app (Android)**

- Clock in and out only inside the school's geo-fence, with fingerprint or face confirmation
- A running timer that pauses when you clock out and carries on when you clock in again
- Attendance history, leave balance and leave requests
- Latest payslip with earnings and deductions, and loan balances
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

### 2. Web admin

```bash
cd Frontend/web
npm install
npm run dev
```

The address of the API is the `url` constant in `Frontend/web/src/resources/api.jsx`.

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
tunnel), put its address in the two files above and add the website's address to
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

They cover payroll and loan deductions, absences and holidays, the age rule for employees,
password rules and resets, cookie login and the CSRF check, and the audit entries for failed
clock-ins. The test setup refuses to run on any database other than `biogeohr_test`.

## How it works

**Payroll.** Pay is semi-monthly (the 1st to the 15th, and the 16th to the end of the month).
The daily rate is the monthly salary divided by the employee's working days per month. SSS,
PhilHealth, and Pag-IBIG contributions and the BIR withholding tax are computed per cutoff. Absences
deduct a day's pay, three or more lates in a month deduct one day's pay, work on the rest day
(Sunday) and on holidays earns extra pay, and loans are deducted from the first cutoff only, with
whatever net pay can cover.

**Loans.** One active loan per employee, up to ₱10,000, taken as a monthly deduction. Company and
Cash Advance loans must finish within the school year, and no loan may need more than 36 deductions.

**Clock-in.** The phone sends its position to the server, which checks it against the assigned
location's radius, then the employee confirms with a fingerprint or face. A GPS that is off, a failed
biometric check, or a position outside the fence is written to the audit log. A background check
flags an employee who leaves the fence while clocked in.

**Security.**

- The website keeps the login in an `HttpOnly`, `Secure` cookie (not readable by JavaScript). It needs
  HTTPS or `localhost`, and a request that changes data must carry an `X-Requested-With` header.
- The phone uses a bearer token.
- Employees set their own password with at least 8 characters, an uppercase letter, a lowercase letter,
  and a number. HR never chooses it. A forgotten password is reset by HR and emailed.
- Every sensitive action is recorded in the audit log without the secret itself.

## Backups

```bash
backup.bat                          # saves backups/biogeohr_<date>.sql and the uploaded photos
restore.bat backups\file.sql        # replaces the current database after you type YES
```

Both scripts use the Laragon MySQL path and the `biogeohr_backend` database. Edit the top of each
file if yours is different.

## Team workflow

```bash
git branch -a                       # list branches
git checkout <branch>               # switch branch
git add <directory>
git commit -m "message"
git push
```

Work on your own branch and open a pull request into `main`.
