const URL = "https://hnbxhuqficktoaivrrqj.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuYnhodXFmaWNrdG9haXZycnFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTk4NDQsImV4cCI6MjA4MjczNTg0NH0.Q1fHRK4uqxrL5fxiuqS076DRq0xH5UoSnzOcCSzn4Qs";

async function check() {
  try {
    console.log("Checking if table 'evaluaciones_remotas' is accessible...");
    const resEval = await fetch(`${URL}/rest/v1/evaluaciones_remotas?select=*&limit=1`, {
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    });
    console.log("evaluaciones_remotas status:", resEval.status);
    if (resEval.status === 200) {
      console.log("SUCCESS: evaluaciones_remotas exists and is accessible!");
    } else {
      console.log("FAIL: evaluaciones_remotas response body:", await resEval.text());
    }

    console.log("Checking if 'anotacion_clinica' exists on 'sesiones_clinicas'...");
    const resSess = await fetch(`${URL}/rest/v1/sesiones_clinicas?select=anotacion_clinica&limit=1`, {
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    });
    console.log("sesiones_clinicas select status:", resSess.status);
    if (resSess.status === 200) {
      console.log("SUCCESS: anotacion_clinica column exists on sesiones_clinicas!");
    } else {
      console.log("FAIL: sesiones_clinicas select response body:", await resSess.text());
    }

  } catch (e) {
    console.error("Error checking database via REST API:", e);
  }
}

check();
