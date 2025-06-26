# ♻️ SmartWaste+

SmartWaste+ is a PWA-based waste management and reward platform aligned with **SDG 11 (Sustainable Cities and Communities)**. It incentivizes users to exchange reusable waste (e.g., plastic bottles, cans, electronics) for points, which can be used to purchase items or services from participating shops.

---

## 🚀 Features

* 🔐 **Google Authentication**

  * Login with Google (Firebase Auth)
  * Cookie/session handling for smoother UX
* 👥 **Role-Based Access**

  * **Users**: Earn/exchange points via QR or barcode
  * **Admins (Shop Owners)**: Manage shops, approve exchanges
  * **Superadmins**: Global managers with point control and admin privileges
* 📦 **Reusable Component Utils**

  * Modular component structure
* 🌐 **Progressive Web App (PWA)**

  * Offline support with `manifest.json`, icons, `sw.js`
* 🔔 **Push Notifications**

  * Real-time alerts for exchanges, updates
* 📡 **Firebase Integration**

  * Firestore DB and Google Auth
* 🧠 **IndexedDB**

  * Store detailed user data locally for performance and offline support
* 🍪 **Cookie Management**

  * Persist login state and fallback data for crash recovery
* 🧩 **Middleware**

  * Route protection and role validation

---

## 🧭 User Roles

| Role           | Description                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| **User**       | Scans QR/barcodes to earn points for contributing reusable items. Can redeem points for goods/services. |
| **Admin**      | Shop owner. Verifies and exchanges points for reusable items. Manages stock and product listings.       |
| **Superadmin** | Oversees the platform. Manages admins and can issue infinite points.                                    |

---

## 🛠️ Tech Stack

* **Frontend**: PWA, Tailwind CSS, IndexedDB
* **Auth**: Firebase Google Login
* **Database**: Firebase Firestore, IndexedDB (client-side)
* **Backend Logic**: Firebase functions or local Node/Express (optional)
* **Notifications**: Push API + Firebase Cloud Messaging
* **Storage**: Cookies & IndexedDB for session & state persistence

---

## 🗂️ Project Structure (Key Folders)

```
smartwaste/
│
├── auth/          # Google login handling
├── middleware/    # Role-based routing & access control
├── utils/         # Common reusable components
├── cookie/        # Session persistence and fallback crash data
├── indexdb/       # Local user storage for smooth UX
├── firebase/      # Firebase setup (DB + Auth)
├── db/            # Database abstraction logic
├── pwa/           # manifest.json, icons, service worker
├── noti/          # Push notification handling
```

---

## 📌 SDG Alignment

SmartWaste+ contributes to the **UN Sustainable Development Goal 11: Sustainable Cities and Communities** by promoting:

* Responsible recycling behavior
* Incentivized waste disposal
* Digital infrastructure for circular economies

---

## 📱 Demo & Deployment

PWA ready – install on your phone or desktop.

> 📦 Demo link coming soon...

---

## 🤝 Contribution

Feel free to fork, open issues, or submit PRs!

---

## 📄 License

MIT License © 2025 SmartWaste Team
