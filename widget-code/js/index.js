var socket = io.connect('http://localhost:3001');
$(document).ready(function(){
    $(".chat-icon").click(function(){
        $(".chat-body").slideToggle(500);    
    });
    
    $(".chat-start .chat-icon").click(function(){
        $(".show-hide-chat").slideToggle(500);    
    });
    
    //topgle chat setting
    $('.toogle-menu').click(function(){
      if ( $('.toogle-menu ul').css('visibility') == 'hidden' )
        $('.toogle-menu ul').css('visibility','visible');
      else
        $('.toogle-menu ul').css('visibility','hidden');
    });
    
     //send chat on email
    $(".end-chat").click(function(){
        $(".show-hide-chat .start-chat-body").hide(); 
        $(".show-hide-chat .send-chat").show(); 
    });
    
    //send chat email
    $(".send-chat .text-box .yes").click(function(){
        $(".send-chat .text-box").hide();
        $(".send-email").show();
    });
    
     //successful message
    $(".send-email input[type='submit']").click(function(){
        $(".send-email .success").show();
    });
    
    //hide chat
    $(".send-chat .text-box .no").click(function(){
        $(".chat-box-login").show();
        $(".chat-box-inner").hide();
    });
});

function ChatViewModel(){
    var self = this;
    self.customerId = ko.observable();
    self.conversationId = ko.observable();
    self.customerName = ko.observable();
    self.customerEmail = ko.observable();
    self.customerMobile = ko.observable();
    self.addCustomerInfo = function(){
        $.ajax("http://localhost:3000/customer", {
            data: ko.toJSON({ email: self.customerEmail(), phone: self.customerMobile(), firstName: self.customerName(), lastName: ""}),
            type: "post", contentType: "application/json",
            success: function(result) {
                console.log(result);
                self.customerId(result.customerId);
                self.conversationId(result.conversationId);
                self.getMessages();
                socket.emit('joined conversation', {conversationId:result.conversationId, userId:self.customerEmail(), senderType:'Customer'});
            }
        });
    }
    self.chatViewVisible = ko.computed(function(){
        return (self.customerId() === null || self.customerId() === undefined) && (self.conversationId() === null || self.conversationId() === undefined);
    });
    
    self.messagesList = ko.observableArray([]);
    self.getMessages = function(){
        $.ajax("http://localhost:3000/customer/"+self.conversationId(), {
            type: "get", contentType: "application/json",
            success: function(result) {
                result.conversation.forEach(function(conv){
                    var message = {
                        conversationId: conv.conversation._id,
                        body: conv.body,
                        senderId: conv.author.item._id,
                        senderName: conv.author.item.profile.firstName + conv.author.item.profile.lastName,
                        senderType: conv.author.kind,
                        sentAt: conv.sentAt
                    };
                    self.messagesList.push(message);
                });
            }
        });
    }
    self.getClass = function(userType){
        return ko.computed(function(){
            if(userType === 'Customer')
                return 'user-chat';
            return 'admin-chat';
        });
    }
    self.messageToSend = ko.observable();
    self.sendButtonHandler = function(){
        console.log(self.conversationId());
        
        var message = {
            conversationId: self.conversationId(),
            body: self.messageToSend(),
            senderId: self.customerId(),
            senderName: self.customerName(),
            senderType: 'Customer'
        };
        
        socket.emit('new message', message);
        self.messageToSend('');
//        self.messagesList.push(message);
    }
}

var chatVM = new ChatViewModel();
ko.applyBindings(chatVM, document.getElementById('chat-box'));

socket.on('receive message', function(conversation){
    console.log('received message : ' + conversation);
    chatVM.messagesList.push(conversation);
});