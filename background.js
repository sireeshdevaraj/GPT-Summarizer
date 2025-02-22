let text = "";

chrome.runtime.onMessage.addListener((message,sender, sendResponse) =>{
  
  if (message == "get-selected-text"){
    if (text == "") {
      sendResponse({
        text : text,
        openedByMe : true
      });
    }
    else sendResponse({
      text : text,
      openedByMe : false
    });
    text = "";
  }
});

function genericOnClick(info){

  if (info.menuItemId == "summarize"){
    text = info.selectionText;
    try{
      chrome.action.openPopup();
    }catch(error){
      console.log(error.message)
    }
  }
}

chrome.contextMenus.onClicked.addListener((info) => genericOnClick(info));


chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: "OFF",
    });
    chrome.contextMenus.create({
      title: 'Summarize this',
      id: 'summarize',
      contexts: ["selection"],
    });
  });