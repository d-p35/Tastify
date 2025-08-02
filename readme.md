# Tastify (React Native/Expo + Supabase + Gemini)

A mobile app that lets users save and organize recipes directly from TikTok and Instagram.
Users can share videos straight to the app, which automatically converts them into structured
recipes with ingredients, steps, and macros using Google's Gemini AI. Recipes can be grouped
into collaborative boards and shopping lists can be generated instantly.

---

## Features

- **iOS Share Extension** – Share TikTok or Instagram links directly into the app.
- **AI Recipe Parsing** – Converts video content into a clean recipe format using Gemini.
- **Supabase Backend** – Secure authentication, recipe storage, and collaborative boards.
- **Chakra UI (React Native)** – Modern, clean interface with theming support.
- **Shopping Lists** – Combine ingredients from multiple recipes.

---

## Tech Stack

- **Frontend**
  - [Expo (React Native)](https://expo.dev/)
  - [Chakra UI React Native](https://github.com/chakra-ui/chakra-ui-react-native)
  - [React Navigation](https://reactnavigation.org/)
  - [React Hook Form](https://react-hook-form.com/)
- **Backend**
  - [Supabase](https://supabase.com/) (Auth + Database + Realtime)
  - [Vercel Serverless Functions](https://vercel.com/) (for Gemini integration)
- **AI**
  - [Google Gemini API](https://ai.google.dev/)

---
