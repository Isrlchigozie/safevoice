import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    currentConversation: null,
    messages: [],
    anonymousToken: null
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setAnonymousToken: (state, action) => {
      state.anonymousToken = action.payload;
      localStorage.setItem('anonymousToken', action.payload);
    },
    loadAnonymousToken: (state) => {
      const token = localStorage.getItem('anonymousToken');
      if (token) {
        state.anonymousToken = token;
      }
    }
  }
});

export const { 
  setConversations, 
  setCurrentConversation, 
  setMessages, 
  addMessage,
  setAnonymousToken,
  loadAnonymousToken
} = chatSlice.actions;
export default chatSlice.reducer;