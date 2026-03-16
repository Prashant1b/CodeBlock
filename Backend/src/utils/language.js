const axios = require('axios');

const encodeBase64Field = (value) => {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  return Buffer.from(value, 'utf8').toString('base64');
};

const decodeBase64Field = (value) => {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  try {
    return Buffer.from(value, 'base64').toString('utf8');
  } catch {
    return value;
  }
};

const normalizeSubmissionPayload = (submission) => ({
  ...submission,
  source_code: encodeBase64Field(submission.source_code),
  stdin: encodeBase64Field(submission.stdin),
  expected_output: encodeBase64Field(submission.expected_output),
  compiler_options: encodeBase64Field(submission.compiler_options),
  command_line_arguments: encodeBase64Field(submission.command_line_arguments),
});

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
      base64_encoded: "true"
    },
    headers: {
      'x-rapidapi-key': process.env.Judge0,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions: submissions.map(normalizeSubmissionPayload)
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      console.error("Judge0 ERROR HEADERS:", response?.headers);
       const resetSeconds = Number(response?.headers?.['x-ratelimit-batched-submissions-reset']);
      const serverDate = response?.headers?.date;

      if (resetSeconds && serverDate) {
        const resetAt = new Date(new Date(serverDate).getTime() + resetSeconds * 1000);
        console.log("Batch quota reset at:", resetAt.toUTCString());
        console.log("Batch quota reset at IST:", resetAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
      }
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

const normalizeSubmission = (submission) => ({
  ...submission,
  stdout: decodeBase64Field(submission.stdout),
  stderr: decodeBase64Field(submission.stderr),
  compile_output: decodeBase64Field(submission.compile_output),
  message: decodeBase64Field(submission.message),
});

const submittoken = async (resulttoken) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resulttoken.join(","),
      base64_encoded: 'true',
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
      return {
        ...response.data,
        submissions: Array.isArray(response.data?.submissions)
          ? response.data.submissions.map(normalizeSubmission)
          : [],
      };
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
