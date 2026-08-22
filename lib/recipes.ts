export type Recipe = {
  id: string;
  title: string;
  category: string;
  time: string;
  calories: number;
  image: string;
  description: string;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  steps: string[];
  featured?: boolean;
  userCreated?: boolean;
  aiInsight?: string;
};

export const RECIPES: Recipe[] = [
  {
    id: 'superfood-bowl',
    title: 'קערת סופרפוד ורודה',
    category: 'ארוחת בוקר',
    time: '10 דק׳',
    calories: 0,
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqrvn_49Vf6fyRMCps0ntG-lK_Vr-5IvETVd-_CWorquKsvxbbd-p5cENnJ9AkBLEdDfjmbBgkGKQve8ZAjocb3iKgDZYEkJ8Ve-sP-71Rt-AjXNaYhDM7G7sNOa2Ua_6tyR_6yhM2oT9bttRAi-cVHmRJQSZa7h5cals0DldrTjVDrbg468QaPt55yRCfqmKypUj0qs_X3xBSl-hXd4SAlnSCazGf-QlQ_Opx1C-t_mR04yV7ZwEf',
    description:
      'קערה צבעונית ומזינה עם פירות יער, זרעי צ׳יה וחמאת שקדים — מושלמת לפתיחת היום.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '1 כוס תותים קפואים',
      '1/2 בננה',
      'כף זרעי צ׳יה',
      'כף חמאת שקדים',
      '1/2 כוס יוגורט יווני',
    ],
    steps: [
      'טוחנים את הפירות והיוגורט עד לקבלת מרקם חלק.',
      'יוצקים לקערה ומפזרים זרעי צ׳יה וחמאת שקדים.',
      'מגישים מיד עם תוספות לפי הטעם.',
    ],
  },
  {
    id: 'avocado-egg',
    title: 'טריו אבוקדו וביצה',
    category: 'ארוחת בוקר',
    time: '15 דק׳',
    calories: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOqixOh5xnMYUeSh6eun-rqMa-2YrL179roZW_ztCKNgX9YdnTI5kS9bkW735FbxpzNdzfVAImGSa_OLa8D8SOtBnkP3ChHxkP77CRawspn6JdEM3h-5OOiMpEXCHsj-9gGTIuUEXOFJr3Zk4Iyf1q7329vDif0l_hVwC9YtWfiv1m28pacH6QwN2rUwYnbrJDuJonhNGHOjQlT0pIaMnLgcAmuYyBZmtEvhrP9mmMV-XhKmluBLie',
    description: 'טוסט מחמצת עם אבוקדו, ביצה עלומה ומיקרו-ירוקים.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '2 פרוסות לחם מחמצת',
      '1 אבוקדו בשל',
      '2 ביצים',
      'מיקרו-ירוקים',
      'פלפל צ׳ילי גרוס',
    ],
    steps: [
      'קולים את הלחם ומורחים אבוקדו מעוך.',
      'מכינים ביצה עלומה ומניחים מעל.',
      'מפזרים מיקרו-ירוקים ופלפל.',
    ],
  },
  {
    id: 'peach-salad',
    title: 'סלט אפרסק צלוי',
    category: 'צהריים',
    time: '20 דק׳',
    calories: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAOxc5w3Eir1_fK7Eb2CWColbyt_52UO1BJWbzUfJBvUnJQyG6rYnHaRTQ6LXJWD-Q7meHawIwJX7TRoWRTZ3So1vJdbS_I5T8KySPk-4fr_F_CjtxabiFs9ZCtxU-8i7FpLSX_FedGrNoF8_UAIvrvCwy5QhAxtmFUTyQyIZAvFVPikX8kfIlkemdNmIFq4Sbn9_bNn0Ql537dAg4BwYrkd1Gz28hMKu4i7cIFcdH194KyQk77tEnI',
    description: 'סלט קיץ קליל עם אפרסקים צלויים, בוראטה ובזיליקום.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '2 אפרסקים',
      'כדור בוראטה',
      'חופן עלי בזיליקום',
      'שמן זית',
      'מלח ופלפל',
    ],
    steps: [
      'צולים אפרסקים על מחבת חמה עד להזהבה.',
      'מסדרים עם בוראטה ובזיליקום.',
      'מתבלים בשמן זית, מלח ופלפל.',
    ],
  },
  {
    id: 'oat-pancakes',
    title: 'פנקייק שיבולת שועל',
    category: 'ארוחת בוקר',
    time: '12 דק׳',
    calories: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8wSr4uLqCNLLpKPHu3JasC9iSYLTjxWhZU_2025c2AxN_V66jIp-2FYQZr5OXrl6XVjG5dBTl-4qT_ji8ZD4PjkVycRApo-s9zja74oWNO9Wgq2VHN6LTt4fV6z42qXQ4A4qH0KA9sh2JxNLnXEOYQiMlXkUp-k3rptxa10aEr5oN2SIqnZBOhpZuhV96ldJ6TpPlJp_QI4VyVADbf7oQAddvPvfPzLFrC_Wabd8F646myX2fGGko',
    description: 'פנקייקים רכים מבננה ושיבולת שועל עם פטל טרי.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '1 בננה בשלה',
      '1 כוס שיבולת שועל',
      '2 ביצים',
      'פטל טרי',
      'כפית דבש',
    ],
    steps: [
      'טוחנים את המרכיבים לבלילה חלקה.',
      'צורבים במחבת אנטי-דבק.',
      'מגישים עם פטל ודבש.',
    ],
  },
  {
    id: 'green-curry',
    title: 'קארי ירוק וטופו',
    category: 'צהריים',
    time: '25 דק׳',
    calories: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDcE69VaEFGGPWRdVgWeQ6nnicUbofpS5xixzmMH7TjO5K77tanckdyNFZ1LEfhYPwThwemcpepq6ZX9iTdPgChk1XtoDOiYcqSITtV60_vMfDQJJJ1DPTh7gs3-AqlrLzb-zFSq47ysze1hwO7_ojyHzLouoas0xeGcTwA02BEUxzivpkW54pkLqro2nJpihud4h_JwNUfrFHGo9jIvzFd0KWtfuvECUKGrBdPjB10ExW93Ic3wy_2',
    description: 'קארי תאילנדי עדין עם טופו, אפונת סוכר וחלב קוקוס.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '200 גרם טופו',
      '2 כפות מחית קארי ירוק',
      '1 כוס חלב קוקוס',
      'אפונת סוכר',
      'עלי בזיליקום תאילנדי',
    ],
    steps: [
      'מחממים את מחית הקארי עם חלב קוקוס.',
      'מוסיפים טופו ואפונת סוכר ומבשלים 10 דקות.',
      'מגישים עם בזיליקום טרי.',
    ],
  },
  {
    id: 'quinoa-salad',
    title: 'סלט קינואה ים־תיכוני',
    category: 'צהריים',
    time: '25 דק׳',
    calories: 0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCzKbwku5eAjFZ94_v67F6rJTK-vB_zkBT0x-VZbfmLwrGd8dF7NQ3Zj0A4mAWCL1alRv-zCmu5ygo2P3b5O0oBXxy_SwoPIgYLeCZfE6FQlC1O2CtqbDItgfag_OGxv_xgN4DkZ2e3uj-pVkYWCKLp2V2Ko7NgyMuwDSorVd5Ut6YDhxvAaBOyUm8SQv_NPfTSsSjTwMi-s5MULim6dXMivq7t5sCkIL_PsUirNdldOVZ6k13h39eE',
    description:
      'סלט עשיר, מרענן ומשביע המשלב את היתרונות התזונתיים של הקינואה עם הטעמים העזים של אגן הים התיכון.',
    protein: 0,
    carbs: 0,
    fats: 0,
    ingredients: [
      '1 כוס קינואה מבושלת',
      '2 מלפפונים חתוכים לקוביות',
      '10 עגבניות שרי חצויות',
      '1/2 בצל סגול קצוץ דק',
      'חופן פטרוזיליה קצוצה',
    ],
    steps: [
      'שוטפים את הקינואה היטב ומבשלים במים רותחים כ-15 דקות עד שהיא מתרככת. מצננים לחלוטין.',
      'קוצצים את כל הירקות לקוביות קטנות ואחידות ומעבירים לקערה גדולה.',
      'מערבבים את הקינואה המצוננת עם הירקות, מוסיפים מיץ לימון סחוט, שמן זית, מלח ופלפל לפי הטעם.',
    ],
  },
];

function estimateNutritionFromIngredients(ingredients: string[]) {
  const ingredientText = ingredients.join(' ').toLowerCase();
  let calories = 220;

  if (/עוף|chicken|דג|tuna|salmon|beef|steak|turkey/.test(ingredientText)) calories += 260;
  if (/אורז|rice|פסטה|pasta|קינואה|quinoa|couscous/.test(ingredientText)) calories += 220;
  if (/אבוקדו|avocado/.test(ingredientText)) calories += 140;
  if (/שמן|oil|חמאה|butter/.test(ingredientText)) calories += 120;
  if (/גבינה|cheese|יוגורט|yogurt/.test(ingredientText)) calories += 110;
  if (/סלט|vegetable|spinach|lettuce/.test(ingredientText)) calories += 80;
  if (/שקד|almond|nut|peanut/.test(ingredientText)) calories += 110;

  const protein = Math.max(12, Math.round(calories * 0.23));
  const carbs = Math.max(20, Math.round(calories * 0.38));
  const fats = Math.max(10, Math.round(calories * 0.39));

  return { calories: Math.round(calories), protein, carbs, fats };
}

export function getBuiltinRecipe(id: string) {
  const recipe = RECIPES.find((r) => r.id === id);
  if (!recipe) return undefined;

  if (recipe.calories > 0 || recipe.protein > 0 || recipe.carbs > 0 || recipe.fats > 0) {
    return recipe;
  }

  const nutrition = estimateNutritionFromIngredients(recipe.ingredients);
  return { ...recipe, ...nutrition };
}

export function getRecipe(id: string) {
  return getBuiltinRecipe(id);
}
