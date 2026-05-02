export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-500w w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-blue-600">
          AI Fitness App
        </h1>
      </div>
      <p className="mt-4 text-xl text-gray-600">
        ברוכה הבאה! כאן נבנה את אפליקציית החיטוב החכמה שלך.
      </p>
      <div className="mt-8 flex gap-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          התחברי
        </button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          צרי פרופיל
        </button>
      </div>
    </main>
  );
}