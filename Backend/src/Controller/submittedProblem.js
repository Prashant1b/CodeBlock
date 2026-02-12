const Submission = require('../models/submissionschema');
const User = require("../models/user")
const Problem = require("../models/problems");
const { getlanguagebyid, submitBatch, submittoken } = require('../utils/language');

const UserSubmission = async (req, res) => {
    try {
        const userid = req.user._id;
        const problemid = req.params.id;
        const { code, language } = req.body;
        if (!userid || !problemid || !code || !language) throw new Error("Field Missing");
        const problemfetch = await Problem.findById(problemid);
        const submittedproblem = await Submission.create({
            userid, problemid, code,
            language,
            status: 'pending',
            testcasetotal: problemfetch.hiddentestcases.length
        });

        const languageid = getlanguagebyid(language);
        const submission = problemfetch.hiddentestcases.map((testcases) => ({
            source_code: code,
            language_id: languageid,
            stdin: testcases.input.trim(),
            expected_output: testcases.output.trim()
        }));

        const submitresult = await submitBatch(submission);
        const resulttoken = submitresult.map((value) => value.token)
        const testresult = await submittoken(resulttoken);

        let testcasepassed = 0;
        let runtime = 0, memory = 0;
        let status = 'accepted';
        let errormessage = '';
        for (const test of testresult) {
            if (test.status_id == 3) {
                testcasepassed++;
                runtime += parseFloat(test.time) * 100;
                memory = Math.max(memory, test.memory);
            } else {
                if (status === 'accepted') { // pehli failure pe hi lock karo
                    status = test.status_id == 4 ? "wrong" : "error";
                    errormessage = test.stderr || test.compile_output;
                }
            }
        }
        submittedproblem.status = status;
        submittedproblem.runtime = runtime;
        submittedproblem.testcasepassed = testcasepassed;
        submittedproblem.memory = memory;
        submittedproblem.errormessage = errormessage;
        await submittedproblem.save();
        //    Problem id ko insert karenge user schema me  agar vo usme nhi hoga to 
        // Sirf accepted submission pe hi problem solved me add karo
        if (status === 'accepted') {
            if (!req.user.problemsolved) {
                req.user.problemsolved = [];
            }

            if (!req.user.problemsolved.includes(problemid)) {
                req.user.problemsolved.push(problemid);
                await req.user.save();
            }
        }

        res.status(200).send("Submission Saved Sucessfully" + submittedproblem);
    } catch (error) {
        res.status(400).send("Error " + error.message);
    }
}

const runCode=async(req,res)=>{
     try {
        const userid = req.user._id;
        const problemid = req.params.id;
        const { code, language } = req.body;
        if (!userid || !problemid || !code || !language) throw new Error("Field Missing");
        const problemfetch = await Problem.findById(problemid);

        const languageid = getlanguagebyid(language);
        const submission = problemfetch.visibletestcases.map((testcases) => ({
            source_code: code,
            language_id: languageid,
            stdin: testcases.input.trim(),
            expected_output: testcases.output.trim()
        }));

        const submitresult = await submitBatch(submission);
        const resulttoken = submitresult.map((value) => value.token)
        const testresult = await submittoken(resulttoken);

        res.status(200).send(testresult);
    } catch (error) {
        res.status(400).send("Error " + error.message);
    }
}

module.exports = {UserSubmission,runCode};


// test result ke andar ye sab ahi code bhi hai source code
//   language_id: 63,
//     stdin: '-5 -2 -10',
//     expected_output: '-10',
//     stdout: '-2\n',
//     status_id: 4,
//     created_at: '2026-02-05T13:57:53.480Z',
//     finished_at: '2026-02-05T13:57:53.706Z',
//     time: '0.017',
//     memory: 8572,
//     stderr: null,
//     token: '19e0bbed-6ba8-4102-b6ca-d1035e45a36d',
//     number_of_runs: 1,
//     cpu_time_limit: '5.0',
//     cpu_extra_time: '1.0',
//     wall_time_limit: '10.0',
//     memory_limit: 256000,
//     stack_limit: 64000,
//     max_processes_and_or_threads: 128,
//     enable_per_process_and_thread_time_limit: false,
//     enable_per_process_and_thread_memory_limit: false,
//     max_file_size: 5120,
//     compile_output: null,
//     exit_code: 0,
//     exit_signal: null,
//     message: null,
//     wall_time: '0.034',
//     compiler_options: null,
//     command_line_arguments: null,
//     redirect_stderr_to_stdout: false,
//     callback_url: null,
//     additional_files: null,
//     enable_network: false,
//     post_execution_filesystem: 'UEsDBBQACAAIADtvRVwAAAAAAAAAALcAAAAJABwAc2NyaXB0LmpzVVQJAAPhoYRp4aGEaXV4CwABBOgDAAAE6AMAAE3MvQrCMBRA4b1P0S25qLd1E0JWN11cXWq8qYH81NwEKuK72zo5n8NnUuTSWm51m+lZXSYpLAtQjfmVWMPaLGOm4X50ni6vaGS/FbXYgwAs2QUJyJN3RXZX3nSAYZjkuYYb5cVxVq4IeopjeWite3ivdvKEPo1ytwc15WSIGWlekB7Up/k/TkN5LOYsEXGlANQXUEsHCG4Y9UKSAAAAtwAAAFBLAQIeAxQACAAIADtvRVxuGPVCkgAAALcAAAAJABgAAAAAAAEAAACkgQAAAABzY3JpcHQuanNVVAUAA+GhhGl1eAsAAQToAwAABOgDAABQSwUGAAAAAAEAAQBPAAAA5QAAAAAA',
//     status: { id: 4, description: 'Wrong Answer' },
//     language: { id: 63, name: 'JavaScript (Node.js 12.14.0)' }
//   }
