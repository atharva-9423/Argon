# Argon Club Platform: PRD + MVP (Website)

*Prepared for: Atharva Phatangare. Intended reader: an AI coding agent (Google AI Studio, Cursor, Claude Code) plus the human team.*

## 1. Product summary

Argon is a closed, hybrid hackathon club for first-year students of the AI & DS department. The platform is a fully gamified web app in the Lattice visual style where admins create member accounts, assign every member to a team, run online and offline sessions and events, and track attendance. Members earn XP, level up, keep streaks, collect badges, and compete on individual and team leaderboards. The Android app comes later and reuses the same Firebase backend, so the website must be built API-first.

**Core idea:** attending, learning, and building should feel like levelling up in a game, and every member belongs to a team from day one.

## 2. Goals and non-goals

**Goals**

- Make it effortless to find, join, and attend online and offline sessions and events.
- Keep first-years coming back through XP, streaks, levels, badges, team rivalry, and game-style animations.
- Give organizers reliable attendance and engagement data.
- Keep a public record of what the club has achieved.

**Non-goals for v1**

- Public sign-up, social login, or any account not created by an admin.
- A custom chat system (link to Discord or WhatsApp instead).
- Payments, complex role hierarchies, and the native Android app.

## 3. Users and roles

| Role | What they can do |
| --- | --- |
| Visitor (not logged in) | See the landing page and public announcements only |
| Member | Log in, see their team, register for events, check in, earn XP, view leaderboards, browse the archive and resources |
| Admin | Everything a member can do, plus manage members, teams, events, attendance, XP, badges, and announcements |

The role is stored as a Firebase custom claim and checked on the server and in Firestore security rules. No other roles in v1.

## 4. Authentication and account management

**Decision:** Firebase Authentication with email and password. There is no public sign-up page.

**Account creation flow (admin only)**

1. The admin adds a member in the admin panel (name, email, year, branch, team) or imports many at once from a CSV.
2. A server route using the Firebase Admin SDK creates the user with a randomly generated password. The Admin SDK must run on the server (Next.js API routes on Vercel, or Cloud Functions), never in the browser, because the client sign-up call would log the admin out.
3. The server sets the role as a custom claim and creates the member's Firestore profile with `mustChangePassword: true`.
4. The admin sends the login details by email from the panel. Firebase cannot send custom emails by itself, so use an email service such as Resend or Nodemailer.
5. On first login the member is forced to set a new password and complete a short profile (skills, interests, optional GitHub link). Completing it gives starter XP.

**Rules**

- Generated passwords are random, temporary, and expire if unused after a few days.
- The plaintext password exists only in the email. It is never stored in Firestore and the admin panel never shows it again.
- Optional safer mode: email a password-reset link instead of a password.
- Admins can reset a member's password and disable or delete an account. Members have a Forgot password link.
- Rate-limit login attempts and the email-sending route.

## 5. Teams

- Every member belongs to exactly one team. A member cannot use the dashboard until assigned.
- Admins create teams (name, colour, banner) and assign or move members from the admin panel. Default is manual assignment; an optional Auto-balance button spreads members evenly (and by skill once profiles are filled), and the admin can adjust afterwards.
- Team XP is the sum of its members' XP, so each member's actions help the team.
- Members see their team name, banner, teammates with each person's XP contribution, and team rank on the dashboard and on a team page.
- There are two leaderboards: individuals and teams.
- Teams can compete across a season (a semester-long competition with a reset and a final prize).

## 6. Gamification system

All values below are configurable defaults stored in settings, not data. The admin can change them without a code change.

**XP sources:** registering for an event, verified attendance (with a bonus for offline sessions), completing a challenge or quiz, submitting a hackathon project, placing in a hackathon, getting an accepted answer in Q&A, completing the first-login profile, and referrals.

**Levels:** a ladder of named levels from beginner to legend with XP thresholds set in settings, shown as an XP bar with a level number.

**Streaks:** weekly attendance streak. Attending at least one session or finishing one challenge in a week extends it. Longer streaks give an XP multiplier. Shown as a flame icon with the week count.

**Badges:** created by the admin (name, description, icon, rule). They appear as a grid of element tiles; locked badges show as dashed empty slots.

**Leaderboards:** weekly, monthly, and all-time. The top 3 appear on a podium and the viewer's own row is always pinned. Weekly boards reset on Monday so newcomers always have a chance.

**Design rule:** reward participation more than winning, so beginners never feel locked out.

## 7. Features

### 7.1 Must-have (MVP)

1. **Login and forced first-login password change**, plus a profile completion step.
2. **Admin member management:** add one member, CSV import, generate password and send email, reset password, disable account, assign team.
3. **Teams:** create, edit, assign, auto-balance, team page, team XP.
4. **Landing page:** club intro, a login button, and public announcements. No sign-up.
5. **Events and sessions:** list and calendar view; Online or Offline tag, date, time, venue or meeting link, description, seats left, XP reward.
6. **Registration:** register and cancel, with a waitlist when full.
7. **Check-in:** rotating QR code for offline sessions and a time-limited code for online ones. XP is awarded by the server.
8. **Member dashboard:** XP bar, level, streak flame, team card, next event with countdown, activity feed.
9. **Leaderboards:** individual and team, weekly, monthly, all-time.
10. **Badges and inventory.**
11. **Session archive:** slides, recording link, notes, and code repo per session, with a Watched mark.
12. **Announcements and email reminders** 24 hours and 1 hour before a registered event.
13. **Admin panel:** events, attendance view and CSV export, manual XP and badge awards with a logged reason, settings for XP rules and levels.

### 7.2 Should-have (after the first events)

- Weekly challenges and quizzes with admin review.
- Hackathon module: team registration, problem statements, submissions, judging scorecards.
- Project showcase with upvotes.
- Q&A board where accepted answers earn XP.
- Resources hub with beginner roadmaps.
- Certificates generated as PDFs.
- Seasons with a reset and a final prize.

### 7.3 Later

- Shareable profile card.
- Live event page with a leaderboard that updates as people check in.
- Mentor directory and booking.
- AI assistant that suggests projects and sessions.
- Android app with push notifications and a QR scanner.

## 8. UI and design direction: Lattice style

The platform reuses the visual language of Lattice, the team's SIH project: calm, editorial, and professional, with a warm cream base, rounded cards, mono micro-labels, and black buttons. Game mechanics (XP, levels, streaks, badges, team rivalry) are expressed through data, motion, and small details instead of pixel art or theme costumes. The reference screenshots of Lattice and the published concept dashboard ('Argon Dashboard: Lattice-style Concept') are the visual source of truth.

**Visual language**

- Colour tokens: page background warm cream (#F1EDE6), sidebar a shade darker (#EBE6DD), cards off-white (#FAF8F4) with 1px warm-grey borders (#E4DED3), near-black text and primary buttons (#1A1814), one accent orange-red (#E8420F) for XP and key numbers, and teal (#2F7F79) as a secondary chart colour. Tag backgrounds are pastel beige, teal, lavender, and peach. Define all of these as design tokens.
- Type: Instrument Sans (or Inter) for interface text with tight tracking on headlines, and JetBrains Mono for uppercase micro-labels, tags, codes, and small data. Stats use very large, bold numerals. Both fonts are open-licensed.
- Shape: 20px card radius, 12px radius on buttons and nav items, pill tags with mono text, solid black primary buttons, and outlined secondary buttons.
- Depth: cards have a soft gradient, a light inner highlight on the top edge, and a layered shadow; hovering lifts a card by about 3px. Countdown boxes are slightly inset and buttons have a subtle top highlight.
- Team colours appear only as small accents (tags, bars, avatars) so the calm base stays intact.

**Member dashboard layout**

- Left sidebar: logo, nav (Dashboard, Events, My team, Leaderboard, Badges, Archive, Alerts with a count, Resources), a Your team card, and a user card with a MEMBER tag and Sign out.
- Top bar: page title, role tag, search, and the primary action (Check in).
- Hero card with a thick black left border and a welcome line that states the XP needed for the next level.
- Four stat cards: Level, Total XP (in the accent colour), Weekly streak, and Team rank.
- A 12-week XP trajectory line chart (you versus team average) beside a team leaderboard with the member's team highlighted.
- Next experiment card with a countdown and a Register button, daily missions with XP chips, and a badge collection with locked slots.

**Game concepts mapped to features**

| Feature | Treatment in this style |
| --- | --- |
| XP and levels | Large bold numerals, an accent-coloured XP figure, a progress bar to the next level, and a count-up when XP changes |
| Streak | Flame outline icon beside the weekly count, with the XP multiplier in a caption |
| Badges | Grid of pastel element tiles (symbol and number); locked badges are dashed empty slots; rarity shown by tile colour |
| Navigation | Sidebar on desktop, bottom tab bar on phones with the same items |
| Events | Experiments or sessions with an Online or Offline tag, a countdown, and an XP reward chip |
| Teams | Colour chip with a short code, a team card in the sidebar, and a team page with a contribution bar per member |
| Leaderboard | Horizontal bars with mono XP values, the member's own row highlighted and pinned, and a podium for the top 3 on the full page |
| Check-in | Full-screen scan view; on success a short confirmation with the XP earned and the new total |
| Level-up | A calm full-width card with the new level number, a number flip, a glow on the progress bar, and any unlocked badge |
| Archive | Notebook-style list of past sessions with a Watched tick |
| Admin panel | Same shell with denser tables, mono column headers, and status tag chips |

**GSAP animations (tasteful, not arcade)**

- Numbers count up and progress bars fill with an ease-out on load and whenever XP changes.
- Cards and rows fade and rise in with a short stagger (ScrollTrigger on long pages).
- Leaderboard rows glide to their new rank (Flip).
- Badge unlock: the dashed slot fills as the tile flips in with a soft glow, then an achievement toast slides in from the top.
- Level-up timeline: the level number flips, the XP bar pulses, and an achievement banner appears.
- Check-in success: a tick draws itself (SVG stroke) and an XP chip floats up into the total.
- Chart lines draw on load.
- Page transitions are a short cross-fade.

**Custom game animations**

- An element tile on the level card with idle orbiting electrons (SVG or small canvas).
- A streak flame with a gentle flicker.
- A team race strip on the leaderboard page where team markers advance as XP changes.
- Soft sound effects (click, XP chime, rising tone for level-up), muted by default with a toggle.

**Usability and performance**

- Mobile-first: the sidebar collapses to a bottom tab bar on phones.
- Body text meets WCAG AA contrast on the cream background.
- Respect `prefers-reduced-motion` by replacing animations with simple fades or no motion.
- Never hide a basic action behind an animation; check-in takes two taps or fewer.
- Admin screens use the same style but skip decorative motion.
- Target pages that load in under 2 seconds on a mid-range phone over 4G.

## 9. Key user flows

**Admin adds a member:** Admin panel > Members > Add or import CSV > assign team > generate password > send email.

**First login:** Email > login > forced new password > profile completion > starter XP and a welcome animation > dashboard.

**Attending an offline session:** Events > Register > reminder email > scan the QR code at the venue > a success animation plays, the XP counter ticks up, streak and team total update.

**Missing a session:** Archive > open session > slides and recording > mark Watched for reduced XP.

**Admin runs an event:** Create event > publish > open check-in at the venue > watch the live attendance counter > close check-in > upload resources > award bonus XP if needed.

## 10. Data model (Firestore)

- **users:** uid, name, email, branch, year, skills, interests, github, role, teamId, xp, level, streakCount, lastActiveWeek, mustChangePassword, disabled, createdAt
- **teams:** name, colour, banner, xpTotal, seasonId
- **events:** title, type, mode (online or offline), startAt, endAt, venueOrLink, description, capacity, xpReward, status
- **registrations:** userId, eventId, status (registered, waitlisted, cancelled), createdAt
- **attendance:** userId, eventId, checkedInAt, method (qr, code, manual)
- **xpTransactions:** userId, teamId, amount, reason, sourceType, sourceId, createdAt. This is the source of truth; XP totals are derived from it.
- **badges and userBadges:** badge definitions and awards with timestamps
- **settings:** XP rules, level thresholds, streak multipliers
- **announcements, resources, sessionArchive**
- Later: challenges, submissions, projects, questions, answers, seasons

Every XP change is logged as a transaction so leaderboards can be audited and recomputed and cheating is easy to reverse.

## 11. Suggested tech stack

- **Frontend:** Next.js (React, TypeScript), Tailwind CSS, GSAP with ScrollTrigger, MotionPath, and Flip. GSAP and its plugins are free to use.
- **Backend:** Firebase Authentication (email and password), Firestore, and Firebase Storage for images and files.
- **Server logic:** Next.js API routes on Vercel using the Firebase Admin SDK (free). Cloud Functions also work but need Firebase's Blaze plan with billing enabled.
- **Email:** Resend or Nodemailer, called from the server only.
- **QR:** a signed token regenerated every 30 to 60 seconds and validated on the server.
- **Hosting:** Vercel or Firebase Hosting.
- **API-first:** keep business logic in server routes so the Android app can reuse it later.

## 12. Security and fairness

- Firestore security rules: members read most data but write only their own profile fields. XP, level, team, role, and attendance are written only by the server.
- Check-in tokens expire quickly and are tied to the event window; one check-in per member per event.
- Cap XP from repeatable actions per week.
- Admin XP changes and revocations are always logged with a reason.
- Service account keys and the email API key live in server environment variables only.

## 13. No demo data

The platform ships empty. Do not add seed scripts, sample users, sample teams, sample events, placeholder leaderboard entries, fake XP, or lorem ipsum to the app or the database.

- Every screen has a clear empty state that tells the user what to do next (for example, the admin sees Create your first event; a member without data sees an encouraging message).
- The only record created before launch is the first admin account, made once through a documented one-time bootstrap step (create the user in the Firebase console, then set the admin claim). No default or shared password is committed to the code.
- XP rules, levels, and badge definitions are configuration and are set up in the admin settings, not preloaded as sample content.
- Use a separate Firebase project for development and testing so test records never reach production.

## 14. MVP build order

**Phase 1: foundation.** Firebase project and Next.js setup, login, forced password change, role claims, admin member creation and CSV import, email sending, Firestore rules, base Lattice-style UI kit (colour tokens, fonts, cards, buttons, sidebar).

**Phase 2: teams and participation.** Teams and assignment, events, registration, QR check-in, XP transactions, member dashboard, leaderboards.

**Phase 3: game feel and retention.** count-up, level-up, and badge-unlock animations, badges and inventory, streak flame, archive, announcements, reminders, sound.

**Phase 4: community.** Challenges, hackathon module, project showcase, Q&A, resources, certificates, seasons.

**Definition of done for MVP:** an admin can create members, assign them to teams, and run a complete event without touching the database; a member can log in, see their team, register, check in by QR, and watch their XP, rank, and team total update.

## 15. Success metrics

- Share of first-year AI & DS students with an active account.
- Registration to attendance conversion (target above 60 percent).
- Weekly active members and average streak length.
- Share of members who attend 3 or more sessions.
- Hackathon projects submitted per event.

## 16. Open questions

1. How many admins will there be, and who are they?
2. How many teams, and what size, for the first semester?
3. Which email service will send login details and reminders?
4. Who designs the badge and element icons, and where will sound effects come from?
5. Will prizes be tied to the team or individual leaderboard?

## 17. Instructions for the AI coding agent

- Build in the phases above and finish each phase before starting the next.
- Begin by proposing the Firestore schema and security rules, then wait for confirmation.
- Use TypeScript and keep components small and reusable.
- Do not create any demo, sample, or seed data (section 13). Build empty states instead.
- Write all XP logic in one server-side module with unit tests; the browser never writes XP, level, team, or role.
- Use only original or open-licensed art, fonts, and audio; nothing copied from games, shows, or other brands.
- Honour prefers-reduced-motion and test animations on a low-end phone.
- Do not add features outside the current phase without asking.
