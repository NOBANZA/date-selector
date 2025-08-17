UI:	Column (Date Opening prayer, Closing Prayer)
AI:	Add dates, Edit Date, Delete dates.
    	Show list of booked dates
	Can unlock a booked date
	A full table of dates.
	Booking names shown next to each prayer slot.
	Unlock buttons for each slot.
	A reset button for all bookings.
	Each date has two booking slots: one labeled Brother, the other Sister

	The labels alternate randomly: if one is Brother, the other is Sister

	When the admin adds a new date, the system randomly assigns the opening slot to 	either Brother or Sister, and the closing slot to the other

	Show a confirmation popup with the user's Title and Name before booking.

	If confirmed, gray out the selected slot.

	Display “Booked” instead of the user's name.
•  ✅ The Name and Title fields are cleared when the page loads
•  ✅ They are also cleared after the user confirms a booking
•  ✅ Title is now a required field (user must select it before booking)
•  ✅ Name and Title fields are cleared on page load and after booking confirmation



✅ What You’ve Got Working
User login with credentials from data.json

Booking interface with slot locking and confirmation

Admin panel to manage dates, users, and bookings

Express server serving both frontend and backend

User dignity preserved: No names shown to other users.

Visual clarity: “Booked” + greyed out = unmistakable.

Admin view unaffected: You can still show full names in admin.html.


Checks if the date exists.

Blocks deletion if either opening or closing is present.

Returns a 403 Forbidden response with a clear message.

If the current slot is booked, it shows “Booked by a [Title]”

If not booked, but the other slot is booked:

It suggests the opposite title with “Preferred”

If neither slot is booked, it shows “Book” as usual

Book (Sister Preferred)

or Book (Brother Preferred)

depending on the other slot's booking:


Gives users a clear reason for the failure

Encourages them to refresh without confusion

Keeps the tone respectful and informative

✅ Clear status labels like “Booked by a Sister” or “Available (Brother Preferred)”

🟡 Hover tooltips for booking buttons

🚫 Booking disabled until title + name are filled

✅ Visual feedback after booking

📅 Highlight today’s date

📈 Chronological sorting of dates

📱 Mobile responsiveness


✅ Cancel button in UI
✅ User-only cancellation
✅ 24-hour restriction enforced
✅ UI refreshes immediately
✅ Slot reopens for others
✅ Clean data state
✅ Enhanced styling and mobile responsiveness


- A new admin-login.html page for login
- Backend logic in server.js to validate credentials
- A redirect to admin.html upon successful login
- Session-based access control (simple token-based for now)

Why separate?
- ✅ Security: Keeping login logic separate prevents unauthorized users from loading sensitive admin UI elements before authentication.
- ✅ Clarity: admin-login.html handles authentication; admin.html handles admin functionality. Each page has a single, focused purpose.
- ✅ Performance: You avoid loading admin scripts, data, and UI for users who haven’t logged in yet.
- ✅ Scalability: Easier to add features like password recovery, multi-factor auth, or login analytics without cluttering the admin dashboard.


- 📅 Date of cancellation
- 🙍‍♂️ User info (name, title, username)
- 🙏 Slot type (opening/closing)
- 📝 Reason
- ⏰ Timestamp


🧭 Full Recap: Admin Features & Stewardship Tools
1. 🔐 Admin Login System
- Purpose: Secure access for trusted leaders to manage prayer slots and view logs
- Implementation:
- Created /admin/login route
- Simple password-based login (flat file or env-based for now)
- Session-based access control for admin-only routes
- Outcome: Admins can now log in securely and access privileged views

2. 📅 Admin Dashboard
- Route: /admin/dashboard
- Features:
- View all booked prayer slots
- Unlock slots manually if needed
- See user details and timestamps
- Outcome: Transparent slot management with stewardship in mind

3. 🧾 Unlock Log System
- Purpose: Track every manual unlock for accountability
- Implementation:
- Created unlock_log.json to store:
{
  "adminId": "admin@example.com",
  "slotId": "2025-08-15T10:00",
  "timestamp": "2025-08-15T09:45:00Z"
}
- Displayed logs on /admin/unlocks
- Outcome: Every unlock action is recorded for audit and trust

4. ❌ Cancellation Log System
- Purpose: Track user-initiated cancellations with reasons
- Implementation:
- Created cancellations.json to store:
{
  "userId": "user123",
  "reason": "Scheduling conflict",
  "timestamp": "2025-08-15T14:32:00Z"
}
- Built /admin/cancellations route with:
- Filter by userId, startDate, endDate
- Display table of matching entries
- Count of total filtered cancellations
- Outcome: Admins can monitor patterns and respond with empathy and insight

🌱 Spiritual & Stewardship Impact
- Every feature reinforces:
- Transparency: Logs and filters make actions visible
- Accountability: Admin actions are tracked
- Empathy: Cancellations include reasons, fostering understanding
- Service: Admin tools empower leaders to serve with clarity and care

- Filter out Sundays that are already in the system
- Log which admin added the date
- Expand the dropdown to show more weeks ahead

