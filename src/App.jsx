import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationHeader, Avatar, VoiceCallButton, VideoCallButton, InfoButton } from '@chatscope/chat-ui-kit-react';
import { createClient } from "@supabase/supabase-js";
import pic from './assets/vista.svg';

const supabaseClient = createClient("https://xiwtnuwmnvbcgpuslomn.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpd3RudXdtbnZiY2dwdXNsb21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUwMjY2MjUsImV4cCI6MjAwMDYwMjYyNX0.9Mdc6ZeVafJ7M9z2YzQqYA_TLSuCmJkhh6gn4h0Uj_U");


const API_KEY = "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";
// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a high networth individuals"
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Stewie! Ask me anything about VistaJet!",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message}
    });


    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act. 
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,  // The system message DEFINES the logic of our chatGPT
        ...apiMessages // The messages from our chat with ChatGPT
      ]
    }

    //  const { data, error } = await supabaseClient.functions.invoke('ask-custom-data', {
    //       body: JSON.stringify({ query: JSON.stringify(apiRequestBody) }),
    //     }).then((data) => {
    //       console.log(data);
    //       setMessages([...chatMessages, {
    //         message: data.data.text,
    //         sender: "ChatGPT"
    //       }]);
    //       setIsTyping(false);
    //     });
    //   console.log(data.text);
    //   console.log(error);

  

    await fetch("https://api.openai.com/v1/chat/completions", 
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "600px", width: "357px"  }}>
        <MainContainer>
          <ChatContainer>    
            
          <ConversationHeader>
                      <Avatar src={pic} name="Stuart" />
                      <ConversationHeader.Content>
                        <span style={{
                color: "#b00016",
                alignSelf: "flex-center"
              }}>VistaJet ChatBot</span>
                      </ConversationHeader.Content>
                      <ConversationHeader.Actions>                                                                             
                        <VoiceCallButton title="Start voice call" />
                        <VideoCallButton title="Start video call" />
                        <InfoButton title="Show info" />
                      </ConversationHeader.Actions>                      
                  </ConversationHeader>   
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Stewie is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" attachButton={false} onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App