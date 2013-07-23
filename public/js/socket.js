//
$(document).ready(function() {   

  var socket = io.connect();
  
    socket.on('connect', function() {
        socket.emit('global');
    });

    $('#sender').bind('click', function() {
      socket.emit('message', ' sent a message on ' + new Date());     
    });

    socket.on('server_message', function(data){
      $('#receiver').append('<li>' + data + '</li>');  
    });
});