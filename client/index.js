import React from 'react';
import { View, Text, AsyncStorage } from 'react-native';
import SocketIOClient from 'socket.io-client';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

const USER_ID = '@userId';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      userId: null
    };

    this.determineUser = this.determineUser.bind(this);
    this.onReceivedMessage = this.onReceivedMessage.bind(this);
    this.onSend = this.onSend.bind(this);
    this._storeMessages = this._storeMessages.bind(this);

    this.socket = SocketIOClient('http://10.0.3.2:3333'); //ip localhost in genymotion
    this.socket.on('message', this.onReceivedMessage);
    this.determineUser();
  }

  /**
   * When a user joins the chatroom, check if they are an existing user.
   * If they aren't, then ask the server for a userId.
   * Set the userId to the component's state.
   */
  determineUser() {
    AsyncStorage.getItem(USER_ID)
      .then((userId) => {
        // If there isn't a stored userId, then fetch one from the server.
        if (!userId) {
          this.socket.emit('userJoined', null);
          this.socket.on('userJoined', (userId) => {
            AsyncStorage.setItem(USER_ID, userId);
            this.setState({ userId });
          });
        } else {
          this.socket.emit('userJoined', userId);
          this.setState({ userId });
        }
      })
      .catch((e) => alert(e));
  }

  // Event listeners
  /**
   * When the server sends a message to this.
   */
  onReceivedMessage(messages) {
    this._storeMessages(messages);
  }

  /**
   * When a message is sent, send the message to the server
   * and store it in this component's state.
   */
  
  onSend(messages=[]) {
    const _avatar = 'https://znews-photo-td.zadn.vn/w1024/Uploaded/ofh_fdmzsofw/2018_02_15/201710100433501.jpg'
    mess = {
      _id: messages[0]._id,
      createAt: new Date(),
      text: messages[0].text,
      user: {
        _id: messages[0].user._id,
        name: messages[0].user.name,
        avatar: _avatar
      }
    }
    this.socket.emit('message', mess);
    this._storeMessages(messages);
  }

  render() {
    var user = { _id: this.state.userId || -1 };

    return (
      <GiftedChat
        showUserAvatar={true}
        messages={this.state.messages}
        onSend={this.onSend}
        user={user}
        renderBubble={this.renderBubble.bind(this)}
      />
    );
  }

  // Helper functions
  _storeMessages(messages) {
    this.setState((previousState) => {
      return {
        messages: GiftedChat.append(previousState.messages, messages),
      };
    });
  }

  // Customize Color
  renderBubble = props => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: {
          backgroundColor: '#e5e5e5',
        },
        right: {
          backgroundColor: '#099eef',
        },
      }}
      textStyle={{
        left: {
          color: '#000',
        },
        right: {
          color: '#fff',
        },
      }}
    />
  )

}

module.exports = Main;



