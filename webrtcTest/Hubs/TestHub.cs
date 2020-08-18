using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace webrtcTest.Hubs
{
    public class TestHub: Hub
    {

        public override async Task OnConnectedAsync()
        {
            //await Clients.Client(Context.ConnectionId).SendAsync("iconnected", Context.ConnectionId);
            //await Groups.AddToGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var curId = Context.ConnectionId;
            var user = Constants.UserMappings[curId];

            Constants.UserMappings.Remove(curId);

            await Groups.RemoveFromGroupAsync(curId, user.Room);


            await Clients.GroupExcept(user.Room, curId).SendAsync("userdisconnected", user.UserId);

            //await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SignalR Users");
            await base.OnDisconnectedAsync(exception);
        }


        public async Task joinroom(string roomid, string userid)
        {

            Console.WriteLine($"jesus room: {roomid}  userid : {userid}");
            var curId = Context.ConnectionId;
            Constants.UserMappings.AddOrUpdate(curId, new UserObj { 
                UserId=userid,
                Room=roomid
            });

            await Groups.AddToGroupAsync(curId, roomid);

            await Clients.GroupExcept(roomid, curId).SendAsync("userconnected", userid);
            //await Clients.AllExcept(Context.ConnectionId).SendAsync("scalable-broadcast-message", message);
            Console.WriteLine($"room: {roomid} \n conId : {curId} \n userid : {userid}");
        }

    }
}
