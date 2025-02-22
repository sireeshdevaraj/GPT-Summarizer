import { OPEN_AI_API_KEY } from "./config.js";

const clearButton = document.getElementById("clear");
const summarizedContent = document.getElementById("summarized-content")
// Trigger when you open something...

chrome.storage.local.get(["prevSummary"]).then(result => {
    if (JSON.stringify(result) == '{}') chrome.storage.local.set({prevSummary : "Nothing here to see yet."})
});

document.addEventListener("DOMContentLoaded",async () => {
    let prev_summary = "";
    chrome.storage.local.get(["prevSummary"]).then(result => {
        prev_summary = result.prevSummary
    });
    chrome.runtime.sendMessage("get-selected-text", async (response) => {
        // Case: [Triggered Manually]: I opened this to read about the previous summary.. so do nothing here..
        if (response.openedByMe){
            summarizedContent.innerHTML = prev_summary;
            return;
        }

        if (response.text == "" || response.text.length < 500) {
            summarizedContent.innerHTML = "Just read it yourself, credits are meant to be saved.."
            return;
        }

        summarizedContent.innerHTML = `
            <div style="display: inline-flex">
            <img src='images/loading.webp' style="width:24px;height:24px">Loading..</img>
            </div>
            `
        
            let summarizedText = await fetch("https://api.openai.com/v1/chat/completions",{
                method : "POST",
                headers: {
                    'Authorization': 'Bearer ' + OPEN_AI_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "model": "gpt-4o-mini",
                    "messages": [
                        { "role" : "developer", "content": "You are a perfect summarizer who explains anything in a simple way and always use simple keywords. For formating use HTML tags."},
                        {"role": "user", "content": response.text}
                    ]
                })
        });

        let r = await summarizedText.json();
        summarizedContent.innerHTML = r.choices[0].message.content;
        chrome.storage.local.set({prevSummary : r.choices[0].message.content});
    })
})

clearButton.addEventListener("click",function(){
    summarizedContent.innerHTML = ""; // Clear HTML
    // Reset it back..
    chrome.storage.local.set({prevSummary : "Nothing here to see yet."})
});