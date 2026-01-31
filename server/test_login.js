
import fetch from 'node-fetch';

async function testLogin() {
    console.log("Attempting login with: admin@example.com / password123");
    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (response.status === 200) {
            console.log("SUCCESS: Login working correctly.");
        } else {
            console.log("FAILURE: Login failed.");
        }
    } catch (error) {
        console.error("ERROR: Could not connect to server.", error.message);
        console.log("Make sure the server is running on port 5000.");
    }
}

testLogin();
