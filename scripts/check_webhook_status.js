const url = "https://cendralingo.my.id/api/webhooks/mayar";
console.log(`Checking ${url}...`);

fetch(url, { method: "GET" })
    .then(res => {
        console.log(`Status Code: ${res.status}`);
        if (res.status === 200) console.log("SUCCESS: New Code is Live (GET Allowed)");
        else if (res.status === 404) console.log("FAIL: Old Code Active (GET Not Found)");
        else console.log("UNKNOWN: " + res.statusText);
    })
    .catch(e => console.error("Error fetching URL:", e));
