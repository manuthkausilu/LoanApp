# 🏦 Loan Application System

A modern mobile loan application management system built with Expo, React Native, and Firebase/Supabase.

## 📱 Features

- 🔐 **Authentication** - Secure login with Firebase Auth
- 📄 **Loan Applications** - Create, view, update, and delete loan applications
- 📎 **Document Upload** - Upload paysheet PDFs to Supabase Storage
- 📊 **Application Management** - Admin panel to manage all loan applications
- 🎨 **Modern UI** - Beautiful interface with NativeWind (Tailwind CSS)
- 📱 **Cross-Platform** - Runs on Android, iOS, and Web

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Routing**: Expo Router (File-based routing)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Supabase Storage (for PDF files)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.com)
   - Copy your Firebase config to `firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Configure Supabase**
   - Update `service/superbase.ts` with your Supabase credentials
   - Create a bucket named `paysheets` in your Supabase project

5. **Start the development server**
   ```bash
   npx expo start
   ```

## 🚀 Running the App

### Development Build
```bash
npm start
```

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 📱 Building for Production

### Using EAS Build

1. **Login to Expo**
   ```bash
   eas login
   ```

2. **Configure EAS**
   ```bash
   eas init
   ```

3. **Build for Android**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Build for Production**
   ```bash
   eas build --platform android --profile production
   ```

## 📁 Project Structure

```
LoanApp/
├── app/                          # App screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation
│   │   ├── (auth)/              # Authentication screens
│   │   │   ├── login.tsx        # Login screen
│   │   │   └── index.tsx        # Auth redirect
│   │   ├── (home)/              # Home screens
│   │   │   ├── index.tsx        # Loan application form
│   │   │   └── viewApplications.tsx
│   │   └── _layout.tsx          # Tab layout
│   └── _layout.tsx              # Root layout
├── assets/                       # Images, fonts, etc.
├── components/                   # Reusable components
├── constants/                    # App constants
├── hooks/                        # Custom React hooks
├── scripts/                      # Build scripts
├── service/                      # Business logic
│   ├── loginService.ts          # Authentication service
│   ├── loanService.ts           # Loan CRUD operations
│   ├── storageService.ts        # File upload/download
│   └── superbase.ts             # Supabase configuration
├── types/                        # TypeScript types
│   └── Loan.ts                  # Loan type definition
├── firebase.ts                   # Firebase configuration
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## 🔧 Configuration Files

### `app.json`
Main Expo configuration with app metadata, icons, splash screen, and plugins.

### `eas.json`
EAS Build profiles for development, preview, and production builds.

### `firebase.ts`
Firebase SDK initialization and exports for Auth and Firestore.

## 🎨 Styling

This project uses **NativeWind**, which brings Tailwind CSS utility classes to React Native:

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-800">
    Hello World
  </Text>
</View>
```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🔐 Security Notes

- Never commit `.env` files or API keys to Git
- Use environment variables for sensitive data
- Enable Firebase security rules for Firestore
- Configure Supabase RLS (Row Level Security) policies

## 🐛 Troubleshooting

### Package Version Conflicts
```bash
npx expo install --check
npx expo install --fix
```

### Clear Cache
```bash
npx expo start -c
```

### Clean Build
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Author

**Manuth / Rayff60**

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

Built with ❤️ using Expo and React Native
