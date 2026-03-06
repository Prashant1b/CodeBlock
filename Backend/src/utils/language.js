const axios = require('axios');
const getlanguagebyid = (lang) => {
  const language = {
    cpp: 54,
    java: 62,
    javascript: 63,
    python: 70
  }

  return language[lang?.toLowerCase()];
}

const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: "false"
    },
    headers: {
      'x-rapidapi-key': process.env.Judge0,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      console.log("Limit:", response.headers['x-ratelimit-limit']);
      console.log("Remaining:", response.headers['x-ratelimit-remaining']);
      console.log("Reset:", response.headers['x-ratelimit-reset']);
      return response.data;
    }
    catch (error) {
      console.error("Judge0 ERROR:", error.response?.data || error.message);
      console.error("Judge0 ERROR HEADERS:", error.response?.headers);
      const resetSeconds = Number(error.response?.headers?.['x-ratelimit-batched-submissions-reset']);
      const serverDate = error.response?.headers?.date;

      if (resetSeconds && serverDate) {
        const resetAt = new Date(new Date(serverDate).getTime() + resetSeconds * 1000);
        console.log("Batch quota reset at:", resetAt.toUTCString());
        console.log("Batch quota reset at IST:", resetAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      }
      throw error;
    }

  }

  return await fetchData();
}

const waiting = (time) => new Promise((resolve) => setTimeout(resolve, time));

const submittoken = async (resulttoken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resulttoken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.Judge0,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  while (true) {
    const result = await fetchData();
    const isresultobtain = result.submissions.every((r) => r.status_id > 2)
    if (isresultobtain) return result.submissions;
    await waiting(1000);
  }
}

module.exports = { getlanguagebyid, submitBatch, submittoken };