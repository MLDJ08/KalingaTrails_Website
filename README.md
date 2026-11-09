# Kalinga Trails Website

This updated project continues the original Kalinga Trails HTML pages, typography, navigation and visual design. It uses ONLY HTML, CSS, and vanilla JavaScript. There is no Python, Flask, Node application server, or database code in this ZIP.

## Start

1. Extract the ZIP, and open the `KalingaTrails_Website` folder in VS Code.
2. Install/use the VS Code **Live Server** extension.
3. Right-click `index.html` and select **Open with Live Server**.
4. Use the site's **Sign Up** button to create a local demo hiker, or **Log In** to access the demo role shortcuts.
5. Do not navigate to `/book/1` — this is not a route in a static website. Bookings live at `book.html?hike=1` and are linked from each hike detail page.

> This is a browser-only, single-device prototype. Accounts and passwords are **not securely authenticated**. Local passwords are hashed in the browser, but authentication can be bypassed by editing local storage. Role selection is for demonstrations only. Local browser storage is not a protected database, shared between users, or synchronized across devices. Booking requests, health-declaration selections, contacts, uploads, messages, and notifications remain in localStorage on the device. **Do not enter real personal or medical data.** Real email is NOT sent. Do not deploy as a live business booking service.

## Demo workflow

1. Sign Up as a hiker; then from **Trails & Hikes**, open a hike and select **Book This Hike**.
2. Fill out the form, enter your own account name on the **first line** of participants, and confirm. It will appear as **Pending** in **My Bookings** and available slots decrease.
3. Log out and open **Log In**. Choose **Admin demonstration**. In **Manage Bookings**, select **Confirm**.
4. For a completion demonstration, use **Manage Hikes > Edit** to set a scheduled date to **today or earlier**. (The demo starts with future hike schedules.)
5. Log out, open **Log In**, select **Guide demonstration**. Open **Check-in**. Mark the named account holder **Present**, then **Completed**, and save.
6. Return to the original hiker account through **Log In**. **Hiking History & Stats** and **Achievements** will reflect the guide-verified completion.
7. For social testing, register another local hiker and exchange friend requests, posts, kudos and comments.

Guide confirmations and attendance may be completed only for the selected guide's confirmed bookings. The **Completed** value is refused when attendance is not **Present**, and cannot be saved before the hike date. Customers have no interface for changing their official history. Other participants in a group booking are named participants, not registered users; they do not receive achievements on this prototype.

## Files

Original: `index.html`, `about.html`, `trails.html`, `hike-details.html`, `community.html`, `gallery.html`, `contact.html`, `style.css`, `assets/logo.svg`.

Added: `auth.html`, `book.html`, `dashboard.html`, `enhancements.css`, `app.js`, `IMPLEMENTATION_STATUS.md`.

## Reset local demo data

In the browser developer tools > Application > Local Storage, remove the entry `kalinga-trails-demo-v3` and refresh. This resets demo users, bookings, posts, photos and all other changes. Clearing browsing data will also remove them.

## Important limitations

- No secure user login, server-side permissions, real payment, email/SMS/push notifications or live synchronized availability.
- Device/browser-local storage only. Not safe for real customer information or sensitive health declarations.
- In-app notices are saved locally, not delivered to other devices.
- Admin trail and hike editing uses simple prompts; this can be made more polished in a future backend implementation.
- Weather information is a written safety advisory, not a live forecast.
- Images from Unsplash need an internet connection.
- A production system needs backend validation and a real database. Those are intentionally excluded to comply with the HTML/CSS/JS-only instruction.
