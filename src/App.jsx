import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationHeader, Avatar, VoiceCallButton, VideoCallButton, InfoButton, Sidebar, ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import { createClient } from "@supabase/supabase-js";
import pic from './assets/vista.svg';
import vistabot from './assets/vistabot.jpg';
const supabaseClient = createClient(import.meta.env.VITE_API_URL, import.meta.env.VITE_SUPABASE_API_KEY);


const API_KEY = import.meta.env.VITE_OPENAIAPIKEY;

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a high networth individuals"
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "<p>Hello and welcome to the VistaJet chatbot. I am here to help you with any queries you may have.</p><p>On the right hand side are quick links, why not click on one of the button to find out more. Or ask your own question below.</p>",
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


  const chatContainerRef = useRef(null);

  const handleSavePDF = () => {
    const chatContainer = chatContainerRef.current;
    html2pdf()
      .set({ margin: 10 })
      .from(chatContainer)
      .save('vistajet-chat-transcription.pdf');
    };

  return (
    <div className="App">
      <div className="chatContainer">
        <MainContainer>
          <ChatContainer>    
            
          <ConversationHeader>
                      <Avatar src={pic} name="Stuart" />
                      <ConversationHeader.Content>
                        <span style={{
                color: "#b00016",
                alignSelf: "flex-center",
                textAlign:"center"
              }}>VistaJet ChatBot</span>
                      </ConversationHeader.Content>
                      <ConversationHeader.Actions>                                                                             
                        <a href="tel:+447830150627"><VoiceCallButton title="Start voice call" /></a>
                        <button onClick={handleSavePDF} className='cs-button cs-button--voicecall' title="Download Chat">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 3 20 20" id="download-chat" className='svg-inline--fa'><path d="M19,14a1,1,0,0,0-1.22.72A7,7,0,0,1,11,20H5.41l.64-.63a1,1,0,0,0,0-1.41A7,7,0,0,1,11,6a8.49,8.49,0,0,1,.88,0,1,1,0,1,0,.24-2A8.32,8.32,0,0,0,11,4,9,9,0,0,0,4,18.62L2.29,20.29a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,22h8a9,9,0,0,0,8.72-6.75A1,1,0,0,0,19,14Zm2.71-6.74a1,1,0,0,0-1.42,0L19,8.59V3a1,1,0,0,0-2,0V8.59l-1.29-1.3a1,1,0,1,0-1.42,1.42l3,3a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l3-3A1,1,0,0,0,21.71,7.29Z"></path></svg>
                        </button>
                      </ConversationHeader.Actions>                      
                  </ConversationHeader>   
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="VistaBot is typing" /> : null}
            ><div id="test" ref={chatContainerRef}>
              {messages.map((message, i) => {
                console.log(message.sender)
                return <Message key={i} model={message}>
                  {message.sender === "ChatGPT" ? <Avatar src={vistabot } /> : null} 
                  </Message>
              })}
              </div>
            </MessageList>
            <MessageInput placeholder="Type message here" attachButton={false} onSend={handleSend} />        
          </ChatContainer>
          <Sidebar position="right">
                    <ExpansionPanel open title="Memberships">
                      <button className='question_btn' onClick={() => handleSend('Tell me about the Program membership')}>What is your Program membership?</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VJ25 membership')}>What is your VJ25 membership?</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about the Corporate membership')}>What is your Corporate membership?</button>
                    </ExpansionPanel>
                    <ExpansionPanel title="Fleet">
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VistaJet Global fleet')}>How far does your global fleet travel?</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VistaJet continental fleet')}>How far does your continental fleet travel?</button>
                    </ExpansionPanel>
                    <ExpansionPanel title="Experience">
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VistaJet Private Dining')}>Private Dining</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about Wine in the sky')}>Wine in the sky</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about the Adventures in the sky')}>Adventures in the sky</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about VistaPet')}>VistaPet</button>
                    </ExpansionPanel>
                    <ExpansionPanel title="Broker questions">
                    <button className='question_btn' onClick={() => handleSend('list the global fleet air crafts?')}>What jets are in your Global Fleet?</button>
                    <button className='question_btn' onClick={() => handleSend('list the continental fleet air crafts?')}>What jets are in your Continental Fleet?</button>
                    </ExpansionPanel>       
                    <button className='save-btn' onClick={handleSavePDF}>Save chat (pdf)</button>
            
                  </Sidebar>               
        </MainContainer>
      </div>
    </div>
  )
}

export default App