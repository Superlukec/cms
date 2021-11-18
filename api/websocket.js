const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const async = require('async');

const User = mongoose.model('User');
const Chat = require('./models/chat');

var users = [];

exports.init = function (io) {

    io.on('connection', (socket) => {
        //console.log('a user connected');
        socket.on('disconnect', () => {
            //console.log('user disconnected');

            for(let i = 0; i < users.length; i++) {

                if(socket.id == users[i].socketid) {

                    if(users[i].site_id) {
                        io.to('management-' + users[i].site_id).emit('user_change', (users.length - 1));
                    }

                    users.splice(i, 1);
                }

            }           

        });

        socket.on('hello', (info) => {
            info['socketid'] = socket.id;


            async.series([
                function(callback) {

                    var checkID = new RegExp("^[0-9a-fA-F]{24}$");
                    if ((info._id && checkID.test(info._id)) && (info.site_id && checkID.test(info.site_id))) {
        
                        User.findOne({
                            _id: new ObjectId(info._id),
                            site_id: new ObjectId(info.site_id),
                        }).exec(function (err, user) {
                            
                            if(err) {
                                throw err;
                            }
            
                            if(user) {    
                                // if role is SUPER_ADMIN, ADMIN, EDITOR, AUTHOR
                                if(users.role < 4) {
                                    info['registered'] = true;
                                }
        
                                socket.join('management-' + info.site_id);
        
                            }                                        
            
                            users.push(info);
                            callback();
                        });
                        
                    }
                    else {
                        users.push(info);
                        callback();
                    }
                }
            ],
            // optional callback
            function(err, results) {
                
                //console.log(users.length);

                if(info.site_id) {
                    io.to('management-' + info.site_id).emit('user_change', users.length);
                }

            });

        });

        socket.on('my message', (message) => {

            var checkID = new RegExp("^[0-9a-fA-F]{24}$");

            if(message.chat_id && message.site_id && checkID.test(message.site_id)) {

                Chat.findOne({
                    chat_id: message.chat_id,
                    site_id: message.site_id
                }).exec(function (err, chat) {

                    if(err) {
                        throw err;
                    }

                    if(!chat) {
                        let chat = new Chat();
                        chat.chat_id = message.chat_id;
                        chat.public = true;
                        chat.user_info = {
                            email: message.email,
                            name: message.name
                        }
                        chat.messages.push({
                            text: message.text,
                            author: true
                        });

                        chat.site_id = message.site_id;
                        
                        chat.save((err) => {

                            if(err) {
                                throw err;
                            }

                            socket.join('chat-' + message.chat_id);

                        })
                    }
                    else {

                        chat.messages.push({
                            text: message.text,
                            author: true
                        });

                        chat.save((err) => {

                            if(err) {
                                throw err;
                            }

                        })
                    }

                    if(message.site_id) {
                        io.to('management-' + message.site_id).emit('new message', message);
                    }

                });

            }

        });


        socket.on('reply', (message) => {

            var checkID = new RegExp("^[0-9a-fA-F]{24}$");

            if(message.chat_id && message.site_id && checkID.test(message.site_id)) {

                Chat.findOne({
                    _id: new Object(message.chat_id),
                    site_id: message.site_id
                }).exec(function (err, chat) {

                    if(err) {
                        throw err;
                    }

                    if(chat) {

                        chat.messages.push({
                            text: message.text,
                            author: false
                        });

                        chat.save((err) => {

                            if(err) {
                                throw err;
                            }

                            io.to('chat-' + chat.chat_id).emit('reply', message);

                        })
                    }

                });

            }

        });

        socket.on('chat open', (message) => {

            var checkID = new RegExp("^[0-9a-fA-F]{24}$");

            if(message.chat_id && message.site_id && checkID.test(message.site_id)) {

                Chat.findOne({
                    _id: new Object(message.chat_id),
                    site_id: message.site_id
                }).exec(function (err, chat) {

                    if(err) {
                        throw err;
                    }

                    if(chat) {

                        chat.opened = true;

                        chat.save((err) => {

                            if(err) {
                                throw err;
                            }

                        })
                    }

                });

            }

        });


        socket.on('leave room', (message) => {

            if(message.chat_id) {
                
                socket.leave('chat-' + message.chat_id);
                
            }

        });
    });

}

exports.getUsers = function(site_id) {

    let result = [];

    for(let i = 0; i < users.length; i++) {

        if(users[i].site_id == site_id) {
            result.push(users[i]);            
        }

    }

    return result;    
}
