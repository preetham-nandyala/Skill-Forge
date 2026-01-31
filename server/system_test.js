// using global fetch
// Actually, let's stick to global fetch.

const BASE_URL = 'http://localhost:5000/api';
let ADMIN_TOKEN = '';
let USER_TOKEN = '';
let USER_ID = '';
let TEST_ID = '';
let QUESTION_ID = '';
let CONTEST_ID = '';

const color = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    yellow: (text) => `\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[34m${text}\x1b[0m`
};

const step = (msg) => console.log(color.blue(`\n[STEP] ${msg}`));
const pass = (msg) => console.log(color.green(`  ✔ ${msg}`));
const fail = (msg, err) => {
    console.log(color.red(`  ✘ ${msg}`));
    if (err) console.error(err);
    // process.exit(1); // Don't exit, try to continue to see other failures
};

const req = async (method, endpoint, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    const data = await res.json();
    return { status: res.status, data };
};

const main = async () => {
    console.log("Starting System Test...");

    // 1. Auth: Login as Admin (Seed admin)
    step("Admin Login");
    let res = await req('POST', '/users/login', { email: 'admin@example.com', password: 'password123' });
    if (res.status === 200 && res.data.token) {
        ADMIN_TOKEN = res.data.token;
        pass("Admin logged in");
    } else {
        fail("Admin login failed", res.data);
        return;
    }

    // 2. Auth: Register New User
    step("User Registration");
    const testUserEmail = `testuser_${Date.now()}@example.com`;
    res = await req('POST', '/users/register', { name: "Test User", email: testUserEmail, password: "password123" });
    if (res.status === 201) {
        USER_TOKEN = res.data.token;
        USER_ID = res.data._id;
        pass("User registered");
    } else {
        fail("User registration failed", res.data);
    }

    // 3. Admin: Create Question
    step("Create Question");
    res = await req('POST', '/admin/questions', {
        text: "What is 2 + 2?",
        type: "MCQ",
        difficulty: "Easy",
        options: [{ text: "3", isCorrect: false }, { text: "4", isCorrect: true }],
        points: 5
    }, ADMIN_TOKEN);
    if (res.status === 201) {
        QUESTION_ID = res.data._id;
        pass(`Question created: ${QUESTION_ID}`);
    } else {
        fail("Question creation failed", res.data);
    }

    // 4. Admin: Create Test
    step("Create Test");
    res = await req('POST', '/admin/tests', {
        title: "System Check Test",
        duration: 10,
        type: "Mock"
    }, ADMIN_TOKEN);
    if (res.status === 201) {
        TEST_ID = res.data._id;
        pass(`Test created: ${TEST_ID}`);
    } else {
        fail("Test creation failed", res.data);
    }

    // 5. Admin: Add Question to Test
    step("Link Question to Test");
    res = await req('POST', `/admin/tests/${TEST_ID}/questions`, { questionIds: [QUESTION_ID] }, ADMIN_TOKEN);
    if (res.status === 200) {
        pass("Question linked to test");
    } else {
        fail("Linking failed", res.data);
    }

    // 6. User: Start Test
    step("User Start Test");
    res = await req('POST', `/tests/${TEST_ID}/start`, {}, USER_TOKEN);
    if (res.status === 201 || res.status === 200) { // 200 if resuming
        pass("Test started by user");
        // Verify attempt exists
        if (!res.data.attempt) fail("No attempt object returned");
    } else {
        fail("Start test failed", res.data);
    }

    // 7. User: Fetch Questions
    step("User Fetch Questions");
    res = await req('GET', `/tests/${TEST_ID}/questions`, null, USER_TOKEN);
    if (res.status === 200 && res.data.questions.length > 0) {
        pass(`Fetched ${res.data.questions.length} questions`);
        const qId = res.data.questions[0]._id;
        if (qId !== QUESTION_ID) console.log(color.yellow("      Note: Fetched Question ID matches linked ID logic? " + (qId === QUESTION_ID)));
    } else {
        fail("Fetch questions failed", res.data);
    }

    // 8. User: Submit Answer
    step("User Submit Answer");
    // Need option ID. Admin created it, we don't have it easily unless we parsed fetch response options.
    // Let's re-fetch the question from User view to get option ID
    res = await req('GET', `/tests/${TEST_ID}/questions`, null, USER_TOKEN);
    const questionObj = res.data.questions[0]; // This is the simplified object with simplified options
    // Wait, getTestQuestions endpoint returns options with _id? Yes, populate usually does.
    // Let's assume we pick the 2nd option (index 1) which is "4" (Correct)
    // IMPORTANT: The admin create returned options with Ids? Yes, mongoose generates them.
    // But we need the IDs from the GET response to be sure.

    if (questionObj && questionObj.options && questionObj.options.length > 1) {
        const correctOptId = questionObj.options[1]._id;
        res = await req('POST', `/tests/${TEST_ID}/answer`, {
            questionId: questionObj._id, // This might be the Question ID or the TestQuestion embedded ID? 
            // Controller expects questionId to be the actual Question._id.
            // The getTestQuestions returns `{ _id: q._id ... }` so it matches.
            selectedOptionId: correctOptId
        }, USER_TOKEN);

        if (res.status === 200) {
            pass("Answer saved successfully");
        } else {
            fail("Save answer failed", res.data);
        }
    } else {
        fail("Cannot find options to answer");
    }

    // 9. User: Submit Test
    step("User Submit Test");
    res = await req('POST', `/tests/${TEST_ID}/submit`, {}, USER_TOKEN);
    if (res.status === 200 && res.data.status === 'completed') {
        pass(`Test submitted. Score: ${res.data.score}`);
    } else {
        fail("Submit test failed", res.data);
    }

    // 10. User: Get Results
    step("User Get Results");
    res = await req('GET', `/tests/${TEST_ID}/results`, null, USER_TOKEN);
    if (res.status === 200) {
        pass(`Results fetched. Accuracy: ${res.data.attempt.accuracy}%`);
    } else {
        fail("Get results failed", res.data);
    }

    // 11. Admin: Create Contest
    step("Admin Create Contest");
    const futureTime = new Date(Date.now() + 3600000).toISOString();
    res = await req('POST', '/admin/contests', {
        title: "Auto Test Contest",
        testId: TEST_ID,
        startTime: new Date().toISOString(),
        endTime: futureTime,
        registrationStartTime: new Date().toISOString(),
        registrationEndTime: futureTime
    }, ADMIN_TOKEN);

    if (res.status === 201) {
        CONTEST_ID = res.data._id;
        pass("Contest created");
    } else {
        fail("Contest creation failed", res.data);
    }

    // 12. User: Register for Contest
    step("User Register for Contest");
    res = await req('POST', `/contests/${CONTEST_ID}/register`, {}, USER_TOKEN);
    if (res.status === 201) {
        pass("Registered for contest");
    } else {
        fail("Registration failed", res.data);
    }

    step("System Test Completed");
};

main();
