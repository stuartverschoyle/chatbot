import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator, ConversationHeader, Avatar, VoiceCallButton, VideoCallButton, InfoButton, Sidebar, ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import { createClient } from "@supabase/supabase-js";
import pic from './assets/vista.svg';

const supabaseClient = createClient(import.meta.env.VITE_API_URL, import.meta.env.VITE_SUPABASE_API_KEY);


const API_KEY = import.meta.env.VITE_OPENAIAPIKEY;

// "Explain things like you would to a 10 year old learning how to code."
const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": "Explain things like you're talking to a high networth individuals"
}

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello and welcome to the VistaJet chatbot. I am here to help you with any queries you may have. On the right hand side are quick links, why not click on one of the button to find out more. Or ask your own question.",
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
      <div style={{ position:"relative", height: "600px", width: "500px"  }}>
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
                      </ConversationHeader.Actions>                      
                  </ConversationHeader>   
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="VistaBot is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} >
                  <Avatar src={pic} name="Joe" />
                  </Message>
              })}
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
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VistaJet Global fleet')}>Global Fleet</button>
                      <button className='question_btn' onClick={() => handleSend('Tell me about the VistaJet continental fleet')}>Continental Fleet</button>
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
                  </Sidebar>               
        </MainContainer>
      </div>
    </div>
  )
}

export default App