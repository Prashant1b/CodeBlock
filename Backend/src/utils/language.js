const axios=require('axios');
const getlanguagebyid = (lang) => {
   const language={
    cpp:54,
    java:62,
    javascript:63,
    python:70
}

 return language[lang?.toLowerCase()];
}

const submitBatch=async (submissions)=>{
const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params:{
     base64_encoded:"false"
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
		return response.data;
	} 
  catch (error) {
  console.error("Judge0 ERROR:",error.response?.data || error.message );
  throw error;
}

}

return await fetchData();
}

const waiting=async(time)=>{
  setTimeout(()=>{
    return 1;
  },time);
}

const submittoken=async(resulttoken)=>{
const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens:resulttoken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key':process.env.Judge0,
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
    while(true){
     const result=await fetchData();
     const isresultobtain=result.submissions.every((r)=>r.status_id>2)
     if(isresultobtain) return result.submissions;
     await waiting(1000);
    }
}

module.exports={getlanguagebyid,submitBatch,submittoken};

