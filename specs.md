\# אפיון פרויקט: AI Health \& Fitness Tracker

\## 1. חזון המוצר

אפליקציית Web מבוססת AI שתומכת בתהליך חיטוב וירידה במשקל על ידי פישוט המעקב התזונתי (זיהוי תמונות) ודיוק המטרות.

\## 2. קהל יעד

אנשים בתהליך חיטוב/ירידה במשקל המחפשים כלי נגיש, חינמי וחכם למעקב.

\## 3. User Stories

\- הקמת פרופיל: הזנת נתונים (גיל, משקל, מטרה, אלרגיות, כשרות).

\- חישוב מטרות: המערכת מחשבת קלוריות, חלבון ושתייה באופן אוטומטי.

\- רישום תזונה ב-AI: העלאת תמונה/תיאור וקבלת ערכים תזונתיים עם אפשרות עריכה.

\- ניהול מתכונים: התייעצות עם צ'אט ושמירת מתכונים לספרייה אישית.

\- מעקב התקדמות: הזנת משקל, היקפים ותמונות.

\- עדכון אוטומטי: חישוב מחדש של המטרות בהתאם לירידה במשקל.

\## 4. Tech Stack

\- Frontend: React / Next.js

\- Backend: Next.js API Routes

\- Database: Supabase (PostgreSQL)

\- AI Integration: Google Gemini API (Vision \& Text)

\## 5. Data Schema (Simplified)



\### Users Table

\- id, email, age, gender

\- current\_weight, target\_weight

\- goals: calories\_target, protein\_target, water\_target

\- preferences: allergies, kosher, diet\_type (e.g. Keto)



\### Meals Table

\- id, user\_id

\- food\_name, image\_url

\- nutrition: calories, protein, carbs, fat

\- meal\_type (Breakfast, Lunch, Dinner, Snack)

\- created\_at



\### Water Logs Table

\- id, user\_id, amount\_ml, created\_at



\### Workouts Table

\- id, user\_id, activity\_type, duration\_mins, calories\_burned, created\_at



\### Recipes Table (Library)

\- id, user\_id (who saved it)

\- title, image\_url, ingredients, instructions

\- prep\_time, meal\_category

\- nutrition\_totals: calories, protein, carbs, fat

